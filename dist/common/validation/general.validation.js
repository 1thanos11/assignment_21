"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginateSchema = exports.generalValidationFields = void 0;
const zod_1 = __importDefault(require("zod"));
const security_enums_js_1 = require("../enums/security.enums.js");
const mongoose_1 = require("mongoose");
const user_enums_js_1 = require("../enums/user.enums.js");
const post_enums_js_1 = require("../enums/post.enums.js");
const react_enums_js_1 = require("../utils/email/react.enums.js");
exports.generalValidationFields = {
    username: zod_1.default
        .string({ error: "username must be string" })
        .min(1, { error: "username can't be less than 1" })
        .max(15, { error: "username can't be exceed 15" }),
    confirmPassword: zod_1.default.string(),
    email: zod_1.default.email({ error: "enter valid email format" }),
    password: zod_1.default.string({ error: "password must be string" }),
    phone: zod_1.default.string(),
    gender: zod_1.default.enum(user_enums_js_1.GenderEnum).default(user_enums_js_1.GenderEnum.MALE),
    DOB: zod_1.default.date(),
    otp: zod_1.default.coerce.number().int().min(100000).max(999999),
    flag: zod_1.default.enum(security_enums_js_1.LogoutEnum).default(security_enums_js_1.LogoutEnum.ONE),
    id: zod_1.default.string().refine((val) => {
        return mongoose_1.Types.ObjectId.isValid(val);
    }, {
        error: "invalid id",
    }),
    file: zod_1.default.custom((file) => {
        return (typeof file === "object" &&
            file !== null &&
            "mimetype" in file &&
            "size" in file);
    }, "Invalid file"),
    files: zod_1.default.custom((files) => {
        if (!Array.isArray(files))
            return false;
        return files.every((file) => {
            return (typeof file === "object" &&
                file !== null &&
                "mimetype" in file &&
                "size" in file);
        });
    }, "Invalid files"),
    ContentType: zod_1.default.string(),
    originalname: zod_1.default.string(),
    FCM: zod_1.default.string(),
    content: zod_1.default.string(),
    postFiles: zod_1.default.array(zod_1.default.any()),
    tags: zod_1.default.array(zod_1.default.string()),
    availability: zod_1.default.enum(post_enums_js_1.AvailabilityEnum).default(post_enums_js_1.AvailabilityEnum.PUBLIC),
    react: zod_1.default.enum(react_enums_js_1.ReactTypeEnum),
    removeFiles: zod_1.default.array(zod_1.default.string()),
    removeTags: zod_1.default.array(zod_1.default.string()),
};
exports.paginateSchema = {
    query: zod_1.default.strictObject({
        page: zod_1.default.coerce.number().optional(),
        size: zod_1.default.coerce.number().optional(),
        search: zod_1.default.string().min(2).optional(),
    }),
};
