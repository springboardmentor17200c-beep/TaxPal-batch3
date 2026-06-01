import Joi from "joi";

const register = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
    country: Joi.string().allow(""),
    income_bracket: Joi.string().allow(""),
    phone: Joi.string().allow(""),
    address: Joi.string().allow(""),
    tax_id: Joi.string().allow(""),
    filing_status: Joi.string().allow(""),
    professional_role: Joi.string().allow(""),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
};

const changePassword = {
  body: Joi.object().keys({
    current_password: Joi.string().required(),
    new_password: Joi.string().required().min(8),
  }),
};

const updateProfile = {
  body: Joi.object().keys({
    name: Joi.string(),
    email: Joi.string().email(),
    country: Joi.string().allow(""),
    income_bracket: Joi.string().allow(""),
    phone: Joi.string().allow(""),
    address: Joi.string().allow(""),
    tax_id: Joi.string().allow(""),
    filing_status: Joi.string().allow(""),
    professional_role: Joi.string().allow(""),
  }),
};

export default {
  register,
  login,
  changePassword,
  updateProfile,
};
