export const formatCurrency = (amount: number, country?: string) => {
  const currencyMap: Record<string, string> = {
    India: "INR",
    "United States": "USD",
    "United Kingdom": "GBP",
    Canada: "CAD",
    Australia: "AUD",
    Germany: "EUR",
    France: "EUR",
  };

  const localeMap: Record<string, string> = {
    India: "en-IN",
    "United States": "en-US",
    "United Kingdom": "en-GB",
    Canada: "en-CA",
    Australia: "en-AU",
    Germany: "de-DE",
    France: "fr-FR",
  };

  const currency = currencyMap[country || "United States"] || "USD";
  const locale = localeMap[country || "United States"] || "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(Number(amount) || 0);
};

// ✅ ADD THIS FUNCTION
export const getCurrencySymbol = (country?: string) => {
  const currencyMap: Record<string, string> = {
    India: "INR",
    "United States": "USD",
    "United Kingdom": "GBP",
    Canada: "CAD",
    Australia: "AUD",
    Germany: "EUR",
    France: "EUR",
  };

  const currency = currencyMap[country || "United States"] || "USD";

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  })
    .format(0)
    .replace(/[0-9.,]/g, "")
    .trim();
};