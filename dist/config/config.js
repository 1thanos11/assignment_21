"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AWS_BUCKET_NAME = exports.AWS_EXPIRES_IN = exports.AWS_SECRET_ACCESS_KEY = exports.AWS_ACCESS_KEY_ID = exports.AWS_REGION = exports.TWITTER_LINK = exports.INSTAGRAM_LINK = exports.FACEBOOK_LINK = exports.EMAIL_PASS = exports.EMAIL_USER = exports.CLIENT_IDS = exports.JWT_CONFIG = exports.IV_LENGTH = exports.ENCRYPTION_SECRET_KEY = exports.OTP_SALT_ROUNd = exports.SALT_ROUND = exports.REDIS_URI = exports.DB_URI = exports.APPLICATION_NAME = exports.PORT = exports.env = exports.NODE_ENV = void 0;
const dotenv_1 = require("dotenv");
const node_path_1 = require("node:path");
const zod_1 = __importDefault(require("zod"));
exports.NODE_ENV = process.env.NODE_ENV;
(0, dotenv_1.config)({ path: (0, node_path_1.resolve)(`./.env.${exports.NODE_ENV}`) });
const envSchema = zod_1.default.object({
    PORT: zod_1.default.coerce.number(),
    DB_URI: zod_1.default.string(),
    REDIS_URI: zod_1.default.string(),
    SALT_ROUND: zod_1.default.coerce.number(),
    OTP_SALT_ROUND: zod_1.default.coerce.number(),
    ENCRYPTION_SECRET_KEY: zod_1.default.string().min(1),
    IV_LENGTH: zod_1.default.coerce.number(),
    USER_ACCESS_TOKEN_SECRET_KEY: zod_1.default.string().min(1),
    USER_REFRESH_TOKEN_SECRET_KEY: zod_1.default.string().min(1),
    ADMIN_ACCESS_TOKEN_SECRET_KEY: zod_1.default.string().min(1),
    ADMIN_REFRESH_TOKEN_SECRET_KEY: zod_1.default.string().min(1),
    ACCESS_TOKEN_EXPIRES_IN: zod_1.default.coerce.number(),
    REFRESH_TOKEN_EXPIRES_IN: zod_1.default.coerce.number(),
    TOKEN_ISSUER: zod_1.default.string().min(1),
    CLIENT_IDS: zod_1.default.string(),
    EMAIL_USER: zod_1.default.string(),
    EMAIL_PASS: zod_1.default.string(),
    AWS_REGION: zod_1.default.string(),
    AWS_ACCESS_KEY_ID: zod_1.default.string(),
    AWS_SECRET_ACCESS_KEY: zod_1.default.string(),
    AWS_BUCKET_NAME: zod_1.default.string(),
    AWS_EXPIRES_IN: zod_1.default.coerce.number(),
});
exports.env = envSchema.parse(process.env);
exports.PORT = exports.env.PORT;
exports.APPLICATION_NAME = process.env.APPLICATION_NAME;
exports.DB_URI = exports.env.DB_URI;
exports.REDIS_URI = exports.env.REDIS_URI;
exports.SALT_ROUND = exports.env.SALT_ROUND;
exports.OTP_SALT_ROUNd = exports.env.OTP_SALT_ROUND;
exports.ENCRYPTION_SECRET_KEY = exports.env.ENCRYPTION_SECRET_KEY;
exports.IV_LENGTH = exports.env.IV_LENGTH;
exports.JWT_CONFIG = {
    User: {
        ACCESS_SECRET: exports.env.USER_ACCESS_TOKEN_SECRET_KEY,
        REFRESH_SECRET: exports.env.USER_REFRESH_TOKEN_SECRET_KEY,
    },
    ADMIN: {
        ACCESS_SECRET: exports.env.ADMIN_ACCESS_TOKEN_SECRET_KEY,
        REFRESH_SECRET: exports.env.ADMIN_REFRESH_TOKEN_SECRET_KEY,
    },
    ACCESS_TOKEN_EXPIRES_IN: exports.env.ACCESS_TOKEN_EXPIRES_IN,
    REFRESH_TOKEN_EXPIRES_IN: exports.env.REFRESH_TOKEN_EXPIRES_IN,
    ISSUER: exports.env.TOKEN_ISSUER,
};
exports.CLIENT_IDS = exports.env.CLIENT_IDS;
exports.EMAIL_USER = exports.env.EMAIL_USER;
exports.EMAIL_PASS = exports.env.EMAIL_PASS;
exports.FACEBOOK_LINK = process.env.FACEBOOK_LINK;
exports.INSTAGRAM_LINK = process.env.INSTAGRAM_LINK;
exports.TWITTER_LINK = process.env.TWITTER_LINK;
exports.AWS_REGION = exports.env.AWS_REGION;
exports.AWS_ACCESS_KEY_ID = exports.env.AWS_ACCESS_KEY_ID;
exports.AWS_SECRET_ACCESS_KEY = exports.env.AWS_SECRET_ACCESS_KEY;
exports.AWS_EXPIRES_IN = exports.env.AWS_EXPIRES_IN;
exports.AWS_BUCKET_NAME = exports.env.AWS_BUCKET_NAME;
