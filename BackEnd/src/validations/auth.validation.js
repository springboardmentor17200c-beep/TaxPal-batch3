import Joi from "joi";

const register = {
  body: Joi.object().keys({
    name: Joi.string().trim().min(1).required().messages({
      "string.empty": "Full name is required",
      "any.required": "Full name is required",
    }),
    email: Joi.string().trim().required().email().messages({
      "string.email": "Please enter a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string().required().min(8).messages({
      "string.min": "Password must be at least 8 characters",
      "any.required": "Password is required",
    }),
    country: Joi.string().allow("").optional(),
    income_bracket: Joi.string().allow("").optional(),
    phone: Joi.string().allow("").optional(),
    address: Joi.string().allow("").optional(),
    tax_id: Joi.string().allow("").optional(),
    filing_status: Joi.string().allow("").optional(),
    professional_role: Joi.string().allow("").optional(),
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

const resetPassword = {
  body: Joi.object().keys({
    email: Joi.string().trim().required().email().messages({
      "string.email": "Please enter a valid email address",
    }),
    password: Joi.string().required().min(8).messages({
      "string.min": "Password must be at least 8 characters",
    }),
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
  resetPassword,
  updateProfile,
};
