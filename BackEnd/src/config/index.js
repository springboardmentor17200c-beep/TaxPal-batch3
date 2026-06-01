import "dotenv/config";
import Joi from "joi";

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid("development", "production", "test").default("development"),
    PORT: Joi.number().port().default(4000),
    MONGODB_URI: Joi.string().required().description("MongoDB connection URI"),
    JWT_SECRET: Joi.string().required().description("JWT Secret Key"),
    CLIENT_URL: Joi.string().default("http://localhost:5173").description("Frontend client URL for CORS"),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: "key" } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URI,
    options: {},
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationDays: 7,
  },
  clientUrl: envVars.CLIENT_URL,
};
