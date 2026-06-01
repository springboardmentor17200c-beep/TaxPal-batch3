import Joi from "joi";

const getTransactions = {
  query: Joi.object().keys({
    type: Joi.string().valid("income", "expense"),
    category: Joi.string(),
    from: Joi.string().isoDate(),
    to: Joi.string().isoDate(),
  }),
};

const getSummary = {
  query: Joi.object().keys({
    from: Joi.string().isoDate(),
    to: Joi.string().isoDate(),
  }),
};

const createTransaction = {
  body: Joi.object().keys({
    type: Joi.string().valid("income", "expense").required(),
    category: Joi.string().required(),
    amount: Joi.number().required(),
    date: Joi.string().isoDate().required(),
    description: Joi.string().allow(""),
  }),
};

const updateTransaction = {
  body: Joi.object().keys({
    type: Joi.string().valid("income", "expense"),
    category: Joi.string(),
    amount: Joi.number(),
    date: Joi.string().isoDate(),
    description: Joi.string().allow(""),
  }),
};

export default {
  getTransactions,
  getSummary,
  createTransaction,
  updateTransaction,
};
