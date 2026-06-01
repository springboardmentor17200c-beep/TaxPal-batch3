import Joi from "joi";

const createReport = {
  body: Joi.object().keys({
    period: Joi.string().required(),
    report_type: Joi.string().required(),
    file_path: Joi.string().allow(""),
    format: Joi.string().valid("PDF", "CSV").default("PDF"),
  }),
};

export default {
  createReport,
};
