

const loadEnvVars = () => {
  const requiredVars = [
    // App
    "PORT",
    "NODE_ENV",
    "SERVER_URL",

    // JWT
    "JWT_SECRET_TOKEN",
    "JWT_REFRESH_TOKEN",
    "JWT_EXPIRES_IN",
    "JWT_REFRESH_EXPIRES_IN",

    // Auth / Security
    "EXPRESS_SESSION",
    "BCRYPT_SALT_ROUND",

    // Google OAuth
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_CALLBACK_URL",
    "FRONT_END_URL",

    // Database
    "DATABASE_URL",

    // Redis
    "REDIS_HOST",
    "REDIS_PORT",
    "REDIS_USERNAME",
    "REDIS_PASSWORD",
    "REDIS_URL",

    // Stripe (✅ REQUIRED NOW)
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_SUCCESS_URL",
    "STRIPE_CANCEL_URL",

    // Apple Wallet
    "APPLE_PASS_TYPE_ID",
    "APPLE_TEAM_ID",
    "APPLE_P12_PASSWORD",
    "APPLE_P12_PATH",
  ];

  requiredVars.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`❌ Missing environment variable: ${key}`);
    }
  });

  return {
    //
    // App
    //
    PORT: Number(process.env.PORT),
    NODE_ENV: process.env.NODE_ENV,
    SERVER_URL: process.env.SERVER_URL,

    //
    // JWT
    //
    JWT_SECRET_TOKEN: process.env.JWT_SECRET_TOKEN,
    JWT_REFRESH_TOKEN: process.env.JWT_REFRESH_TOKEN,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,

    //
    // Security
    //
    EXPRESS_SESSION: process.env.EXPRESS_SESSION,
    BCRYPT_SALT_ROUND: Number(process.env.BCRYPT_SALT_ROUND),

    //
    // Google OAuth
    //
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
    FRONT_END_URL: process.env.FRONT_END_URL,

    //
    // Database
    //
    DATABASE_URL: process.env.DATABASE_URL,

    //
    // Redis
    //
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: Number(process.env.REDIS_PORT),
    REDIS_USERNAME: process.env.REDIS_USERNAME,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_URL: process.env.REDIS_URL,

    //
    // Stripe (🔥 NEW)
    //
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_SUCCESS_URL: process.env.STRIPE_SUCCESS_URL,
    STRIPE_CANCEL_URL: process.env.STRIPE_CANCEL_URL,

    //
    // Node Mailer (Optional)
    //
    EMAIL_SENDER: {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS,
      SMTP_FROM: process.env.SMTP_FROM,
    },

    //
    // Apple Wallet
    //
    APPLE_WALLET: {
      PASS_TYPE_ID: process.env.APPLE_PASS_TYPE_ID,
      TEAM_ID: process.env.APPLE_TEAM_ID,
      P12_PASSWORD: process.env.APPLE_P12_PASSWORD,
      P12_PATH: process.env.APPLE_P12_PATH,
      SIGNER_CERT_PATH: process.env.APPLE_SIGNER_CERT_PATH || "signerCert.pem",
      SIGNER_KEY_PATH: process.env.APPLE_SIGNER_KEY_PATH || "signerKey.pem",
      APNS_KEY_PATH: process.env.APPLE_APNS_KEY_PATH, // .p8 file path
      APNS_KEY_ID: process.env.APPLE_APNS_KEY_ID,
    },
  };
};

export const envVars = loadEnvVars();
