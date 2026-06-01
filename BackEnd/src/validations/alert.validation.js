import Joi from "joi";

const readAlert = {
  params: Joi.object().keys({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  }),
};

const deleteAlert = {
  params: Joi.object().keys({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  }),
};

export default {
  readAlert,
  deleteAlert,
};
