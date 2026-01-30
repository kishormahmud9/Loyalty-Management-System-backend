import dotenv from "dotenv";
dotenv.config();

const loadEnvVars = () => {
  const requiredVars = [
    "PORT",
    "NODE_ENV",
    "SERVER_URL",

    "JWT_SECRET_TOKEN",
    "JWT_REFRESH_TOKEN",
    "JWT_EXPIRES_IN",
    "JWT_REFRESH_EXPIRES_IN",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "EXPRESS_SESSION",
    "FRONT_END_URL",
    "GOOGLE_CALLBACK_URL",
    "BCRYPT_SALT_ROUND",

    "DATABASE_URL",

    "REDIS_HOST",
    "REDIS_PORT",
    "REDIS_USERNAME",
    "REDIS_PASSWORD",
    "REDIS_URL",
  ];

  requiredVars.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`❌ Missing environment variable: ${key}`);
    }
  });

  return {
    // App
    PORT: Number(process.env.PORT),
    NODE_ENV: process.env.NODE_ENV,
    SERVER_URL: process.env.SERVER_URL,

    // JWT
    JWT_SECRET_TOKEN: process.env.JWT_SECRET_TOKEN,
    JWT_REFRESH_TOKEN: process.env.JWT_REFRESH_TOKEN,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
    EXPRESS_SESSION: process.env.EXPRESS_SESSION,
    BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND,

    // google OAuth
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    EXPRESS_SESSION: process.env.EXPRESS_SESSION,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
    FRONT_END_URL: process.env.FRONT_END_URL,

    // Database
    DATABASE_URL: process.env.DATABASE_URL,

    // Redis
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: Number(process.env.REDIS_PORT),
    REDIS_USERNAME: process.env.REDIS_USERNAME,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_URL: process.env.REDIS_URL,

    // node mailer (SMTP)
    EMAIL_SENDER: {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS,
      SMTP_FROM: process.env.SMTP_FROM,
    },
  };
};

export const envVars = loadEnvVars();