import Joi from "joi";

const getCategories = {
  query: Joi.object().keys({
    type: Joi.string().valid("income", "expense"),
  }),
};

const createCategory = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    type: Joi.string().valid("income", "expense").required(),
    description: Joi.string().allow(""),
    color: Joi.string().allow(""),
  }),
};

export default {
  getCategories,
  createCategory,
};
