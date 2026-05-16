import { config } from "dotenv";
import { resolve } from "node:path";
import z from "zod";

export const NODE_ENV = process.env.NODE_ENV;

config({ path: resolve(`./.env.${NODE_ENV}`) });

//env schema
const envSchema = z.object({
  //APP
  PORT: z.coerce.number(),
  //DB
  DB_URI: z.string(),
  REDIS_URI: z.string(),
  //Security
  SALT_ROUND: z.coerce.number(),
  OTP_SALT_ROUND: z.coerce.number(),
  ENCRYPTION_SECRET_KEY: z.string().min(1),
  IV_LENGTH: z.coerce.number(),
  USER_ACCESS_TOKEN_SECRET_KEY: z.string().min(1),
  USER_REFRESH_TOKEN_SECRET_KEY: z.string().min(1),
  ADMIN_ACCESS_TOKEN_SECRET_KEY: z.string().min(1),
  ADMIN_REFRESH_TOKEN_SECRET_KEY: z.string().min(1),
  ACCESS_TOKEN_EXPIRES_IN: z.coerce.number(),
  REFRESH_TOKEN_EXPIRES_IN: z.coerce.number(),
  TOKEN_ISSUER: z.string().min(1),
  //Google
  CLIENT_IDS: z.string(),
  EMAIL_USER: z.string(),
  EMAIL_PASS: z.string(),
  //AWS
  AWS_REGION: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_BUCKET_NAME: z.string(),
  AWS_EXPIRES_IN: z.coerce.number(),
});
export const env = envSchema.parse(process.env);

//App
export const PORT = env.PORT;
export const APPLICATION_NAME = process.env.APPLICATION_NAME;

//DB
export const DB_URI = env.DB_URI;
export const REDIS_URI = env.REDIS_URI;

//Security
export const SALT_ROUND = env.SALT_ROUND;
export const OTP_SALT_ROUNd = env.OTP_SALT_ROUND;
export const ENCRYPTION_SECRET_KEY = env.ENCRYPTION_SECRET_KEY;
export const IV_LENGTH = env.IV_LENGTH;
export const JWT_CONFIG = {
  User: {
    ACCESS_SECRET: env.USER_ACCESS_TOKEN_SECRET_KEY,
    REFRESH_SECRET: env.USER_REFRESH_TOKEN_SECRET_KEY,
  },
  ADMIN: {
    ACCESS_SECRET: env.ADMIN_ACCESS_TOKEN_SECRET_KEY,
    REFRESH_SECRET: env.ADMIN_REFRESH_TOKEN_SECRET_KEY,
  },
  ACCESS_TOKEN_EXPIRES_IN: env.ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN: env.REFRESH_TOKEN_EXPIRES_IN,
  ISSUER: env.TOKEN_ISSUER,
};

//Google
export const CLIENT_IDS = env.CLIENT_IDS;
export const EMAIL_USER = env.EMAIL_USER;
export const EMAIL_PASS = env.EMAIL_PASS;

//Links
export const FACEBOOK_LINK = process.env.FACEBOOK_LINK;
export const INSTAGRAM_LINK = process.env.INSTAGRAM_LINK;
export const TWITTER_LINK = process.env.TWITTER_LINK;

//AWS
export const AWS_REGION = env.AWS_REGION;
export const AWS_ACCESS_KEY_ID = env.AWS_ACCESS_KEY_ID;
export const AWS_SECRET_ACCESS_KEY = env.AWS_SECRET_ACCESS_KEY;
export const AWS_EXPIRES_IN = env.AWS_EXPIRES_IN;
export const AWS_BUCKET_NAME = env.AWS_BUCKET_NAME;
