import "dotenv/config";
import Joi from "joi";

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid("development", "production", "test").default("development"),
    PORT: Joi.number().port().default(4000),
    MONGODB_URI: Joi.string().required().description("MongoDB connection URI"),
    JWT_SECRET: Joi.string().min(16).required().description("JWT Secret Key"),
    CLIENT_URL: Joi.string()
      .default("http://localhost:5173")
      .description("Frontend URL(s) for CORS, comma-separated for multiple origins"),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: "key" } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

if (envVars.NODE_ENV === "production" && envVars.JWT_SECRET.length < 32) {
  throw new Error("Config validation error: JWT_SECRET must be at least 32 characters in production");
}

const clientUrls = envVars.CLIENT_URL.split(",").map((url) => url.trim()).filter(Boolean);

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
  clientUrl: clientUrls[0],
  clientUrls,
};
