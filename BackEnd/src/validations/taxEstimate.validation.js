import Joi from "joi";

const createTaxEstimate = {
  body: Joi.object().keys({
    country: Joi.string().allow(""),
    state: Joi.string().allow(""),
    filing_status: Joi.string().allow(""),
    quarter: Joi.string().required(),
    gross_income_for_quarter: Joi.number().required(),
    business_expenses: Joi.number().allow(null, ""),
    retirement_contribution: Joi.number().allow(null, ""),
    health_insurance_premiums: Joi.number().allow(null, ""),
    home_office_deduction: Joi.number().allow(null, ""),
  }),
};

export default {
  createTaxEstimate,
};
