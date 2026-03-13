/**
 * TaxPal — Tax Engine
 * Provides country-aware tax calculation logic.
 *
 * Supported countries: India, United States (and generic fallback for others)
 */

// ─── INDIA ───────────────────────────────────────────────────────────────────

/**
 * Indian New Regime income tax slabs (FY 2024-25 / AY 2025-26).
 * Each bracket applies to income within [min, max].
 * max = Infinity for the top bracket.
 */
// Boundaries are contiguous: each slab starts exactly where the previous ends.
// slabSize = max - min (no +1), so there are no gaps or double-counted rupees.
const INDIA_SLABS = [
  { min: 0,         max: 300_000,   rate: 0.00 },  // 0 – 3 L
  { min: 300_000,   max: 600_000,   rate: 0.05 },  // 3 – 6 L
  { min: 600_000,   max: 900_000,   rate: 0.10 },  // 6 – 9 L
  { min: 900_000,   max: 1_200_000, rate: 0.15 },  // 9 – 12 L
  { min: 1_200_000, max: 1_500_000, rate: 0.20 },  // 12 – 15 L
  { min: 1_500_000, max: Infinity,  rate: 0.30 },  // > 15 L
];

/** Health & Education Cess rate applied on top of income tax. */
const INDIA_CESS_RATE = 0.04;

/**
 * Maximum annual professional tax in India (most states cap at ₹2,500/yr).
 * We prorate per quarter: ₹2,500 / 4 = ₹625.
 */
const INDIA_PROFESSIONAL_TAX_ANNUAL = 2_500;
const INDIA_PROFESSIONAL_TAX_QUARTERLY = INDIA_PROFESSIONAL_TAX_ANNUAL / 4;

/**
 * States that do NOT levy professional tax.
 * (Non-exhaustive; covers the major exemptions.)
 */
const INDIA_NO_PROF_TAX_STATES = new Set([
  "Rajasthan",
  "Uttar Pradesh",
  "Uttarakhand",
  "Arunachal Pradesh",
  "Nagaland",
  "Manipur",
  "Goa",
  "Delhi",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Andaman and Nicobar Islands",
  "Lakshadweep",
  "Ladakh",
  "Jammu and Kashmir",
  "Other",
]);

/**
 * Calculates income tax using progressive bracket accumulation.
 * @param {number} taxableIncome  Annual taxable income in INR.
 * @returns {number}              Income tax before cess.
 */
function computeIndiaSlabTax(taxableIncome) {
  let tax = 0;
  let remaining = taxableIncome;

  for (const slab of INDIA_SLABS) {
    if (remaining <= 0) break;
    // slabSize = max - min (NOT max - min + 1) to avoid off-by-one
    const slabSize = slab.max === Infinity ? remaining : slab.max - slab.min;
    const taxableInSlab = Math.min(remaining, slabSize);
    tax += taxableInSlab * slab.rate;
    remaining -= taxableInSlab;
  }

  return tax;
}

/**
 * Full India tax calculation.
 *
 * Taxable income is applied DIRECTLY to the progressive slabs — no
 * annualisation. The user enters the income figure they want assessed
 * (quarterly or annual); we tax it as-is and add cess on top.
 *
 * @param {number} taxableIncome  Taxable income in INR.
 * @param {string} state          Indian state name.
 * @returns {{ centralTax: number, stateTax: number, professionalTax: number, totalTax: number }}
 */
export function calculateIndiaTax(taxableIncome, state = "") {
  // Step 1: Apply progressive New Regime slabs to taxable income.
  const slabTax = computeIndiaSlabTax(taxableIncome);

  // Step 2: Add 4% Health & Education Cess on the slab tax.
  const cess = slabTax * INDIA_CESS_RATE;
  const centralTax = slabTax + cess;

  // Step 3: India has NO state income tax.
  const stateTax = 0;

  // Step 4: Professional tax — ₹625/quarter, 0 for exempt states.
  const professionalTax = INDIA_NO_PROF_TAX_STATES.has(state)
    ? 0
    : INDIA_PROFESSIONAL_TAX_QUARTERLY;

  const totalTax = centralTax + stateTax + professionalTax;

  return {
    centralTax: round2(centralTax),
    stateTax: 0,
    professionalTax: round2(professionalTax),
    totalTax: round2(totalTax),
  };
}

// ─── UNITED STATES ───────────────────────────────────────────────────────────

/**
 * Simplified US federal tax brackets (2024, Single filer, quarterly proration).
 * In this app the input is already quarterly, so we keep the US logic simple.
 */
const US_FEDERAL_BRACKETS = [
  { min: 0,      max: 23_200,  rate: 0.10 },
  { min: 23_201, max: 94_300,  rate: 0.12 },
  { min: 94_301, max: 201_050, rate: 0.22 },
  { min: 201_051, max: 383_900, rate: 0.24 },
  { min: 383_901, max: 487_450, rate: 0.32 },
  { min: 487_451, max: 731_200, rate: 0.35 },
  { min: 731_201, max: Infinity, rate: 0.37 },
];

/** Approximate state income tax rates by state (flat-rate approximation). */
const US_STATE_RATES = {
  California:     0.093,
  "New York":     0.0685,
  Texas:          0,
  Florida:        0,
  Washington:     0,
  Nevada:         0,
  "South Dakota": 0,
  Wyoming:        0,
  Alaska:         0,
  "New Hampshire": 0,
};
const US_DEFAULT_STATE_RATE = 0.05;

/**
 * @param {number} taxableIncome  Annual taxable income in USD.
 * @returns {number}              Federal income tax.
 */
function computeUSFederalTax(taxableIncome) {
  let tax = 0;
  let remaining = taxableIncome;
  for (const bracket of US_FEDERAL_BRACKETS) {
    if (remaining <= 0) break;
    const size =
      bracket.max === Infinity ? remaining : bracket.max - bracket.min + 1;
    tax += Math.min(remaining, size) * bracket.rate;
    remaining -= size;
  }
  return tax;
}

/**
 * US quarterly tax calculation.
 *
 * @param {number} quarterlyTaxableIncome
 * @param {string} state
 * @param {number} quarterlyGrossIncome   Needed for self-employment tax base.
 * @returns {{ federalTax: number, stateTax: number, selfEmploymentTax: number, totalTax: number }}
 */
export function calculateUSTax(quarterlyTaxableIncome, state = "", quarterlyGrossIncome = 0) {
  const annualTaxable = quarterlyTaxableIncome * 4;
  const annualGross   = quarterlyGrossIncome * 4;

  const annualFederal = computeUSFederalTax(annualTaxable);
  const federalTax    = annualFederal / 4;

  const stateRate = US_STATE_RATES[state] ?? US_DEFAULT_STATE_RATE;
  const stateTax  = (annualTaxable * stateRate) / 4;

  // Self-employment tax: 15.3% on 92.35% of net self-employment income.
  const selfEmploymentTax = annualGross * 0.9235 * 0.153 / 4;

  const totalTax = federalTax + stateTax + selfEmploymentTax;

  return {
    federalTax:        round2(federalTax),
    stateTax:          round2(stateTax),
    selfEmploymentTax: round2(selfEmploymentTax),
    totalTax:          round2(totalTax),
  };
}

// ─── GENERIC FALLBACK ────────────────────────────────────────────────────────

/**
 * Generic fallback for unsupported countries — uses the original flat-rate logic.
 * @param {number} quarterlyTaxableIncome
 * @param {number} quarterlyGrossIncome
 */
export function calculateGenericTax(quarterlyTaxableIncome, quarterlyGrossIncome = 0) {
  const federalTax        = quarterlyTaxableIncome * 0.12;
  const stateTax          = quarterlyTaxableIncome * 0.04;
  const selfEmploymentTax = quarterlyGrossIncome   * 0.02;
  const totalTax          = federalTax + stateTax + selfEmploymentTax;
  return {
    federalTax:        round2(federalTax),
    stateTax:          round2(stateTax),
    selfEmploymentTax: round2(selfEmploymentTax),
    totalTax:          round2(totalTax),
  };
}

// ─── TOP-LEVEL DISPATCHER ────────────────────────────────────────────────────

/**
 * Calculates estimated quarterly tax for the given country.
 *
 * @param {object} params
 * @param {string} params.country
 * @param {string} params.state
 * @param {string} params.filingStatus
 * @param {number} params.taxableIncome    Quarterly taxable income.
 * @param {number} params.grossIncome      Quarterly gross income.
 * @returns {{
 *   federalTax: number,
 *   stateTax: number,
 *   selfEmploymentTax: number,
 *   totalTax: number
 * }}
 */
export function calculateTax({ country, state, filingStatus, taxableIncome, grossIncome }) {
  if (country === "India") {
    const { centralTax, stateTax, professionalTax, totalTax } =
      calculateIndiaTax(taxableIncome, state);

    // Map to the field names the frontend already reads:
    //   federalTax       → Central Income Tax (incl. cess)
    //   stateTax         → 0 (no state income tax in India)
    //   selfEmploymentTax → Professional Tax
    return {
      federalTax:        centralTax,
      stateTax:          stateTax,
      selfEmploymentTax: professionalTax,
      totalTax,
    };
  }

  if (country === "United States") {
    return calculateUSTax(taxableIncome, state, grossIncome);
  }

  // Canada, UK, Australia, Germany, etc. — generic fallback.
  return calculateGenericTax(taxableIncome, grossIncome);
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Round to 2 decimal places. */
function round2(n) {
  return Math.round(n * 100) / 100;
}

/*
 * ─── EXAMPLE CALCULATION (India) ────────────────────────────────────────────
 *
 * Input:
 *   Gross Income (quarterly)       : ₹10,00,000
 *   Total Deductions (quarterly)   : ₹5,25,000
 *   Taxable Income (quarterly)     : ₹4,75,000
 *   State                          : Maharashtra (has professional tax)
 *
 * Annualised taxable income        : ₹4,75,000 × 4 = ₹19,00,000
 *
 * Slab Tax:
 *   ₹0  – ₹3,00,000  → 0%  = ₹0
 *   ₹3,00,001 – ₹6,00,000  → 5%  = ₹15,000
 *   ₹6,00,001 – ₹9,00,000  → 10% = ₹30,000
 *   ₹9,00,001 – ₹12,00,000 → 15% = ₹45,000
 *   ₹12,00,001 – ₹15,00,000 → 20% = ₹60,000
 *   ₹15,00,001 – ₹19,00,000 → 30% = ₹1,20,000
 *   Annual slab tax                 = ₹2,70,000
 *
 * 4% Cess                          = ₹10,800
 * Annual Central Tax               = ₹2,80,800
 * Quarterly Central Tax            = ₹70,200
 *
 * State Tax                        = ₹0
 * Professional Tax (quarterly)     = ₹625
 *
 * TOTAL QUARTERLY TAX              = ₹70,825
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * NOTE: The example in the user prompt uses ₹10L gross, ₹5.25L deductions →
 * taxable ₹4.75L as a QUARTERLY figure. When annualised (×4 = ₹19L) the
 * correct slab tax is much higher. If the user intended the ₹4.75L as an
 * annual figure, the tax would be:
 *   ₹0–₹3L  → 0%      = ₹0
 *   ₹3L–₹4.75L → 5%   = ₹8,750
 *   Cess 4%             = ₹350
 *   Annual Central Tax  = ₹9,100
 *   Prof Tax (annual)   = ₹2,500
 *   TOTAL ANNUAL TAX    = ₹11,600
 *   Quarterly portion   = ₹2,900
 */
