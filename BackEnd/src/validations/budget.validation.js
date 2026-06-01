import Joi from "joi";

const getBudgets = {
  query: Joi.object().keys({
    month: Joi.string().pattern(/^\d{4}-\d{2}$/),
  }),
};

const createBudget = {
  body: Joi.object().keys({
    category: Joi.string().required(),
    budget_amount: Joi.number(),
    limit: Joi.number(),
    month: Joi.string().pattern(/^\d{4}-\d{2}$/),
    description: Joi.string().allow(""),
  }),
};

const updateBudget = {
  body: Joi.object().keys({
    category: Joi.string(),
    budget_amount: Joi.number(),
    limit: Joi.number(),
    month: Joi.string().pattern(/^\d{4}-\d{2}$/),
    description: Joi.string().allow(""),
  }),
};

export default {
  getBudgets,
  createBudget,
  updateBudget,
};
