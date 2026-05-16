"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.confirmEmailSchema = exports.resendConfirmEmailOtpSchema = exports.signupSchema = exports.loginSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const general_validation_js_1 = require("../../common/validation/general.validation.js");
exports.loginSchema = {
    body: zod_1.default.strictObject({
        email: general_validation_js_1.generalValidationFields.email,
        password: general_validation_js_1.generalValidationFields.password,
        FCM: general_validation_js_1.generalValidationFields.FCM.optional(),
    }),
};
exports.signupSchema = {
    body: zod_1.default
        .strictObject({
        email: general_validation_js_1.generalValidationFields.email,
        password: general_validation_js_1.generalValidationFields.password,
        username: general_validation_js_1.generalValidationFields.username,
        confirmPassword: general_validation_js_1.generalValidationFields.confirmPassword,
        phone: general_validation_js_1.generalValidationFields.phone.optional(),
    })
        .superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({
                path: ["confirm password"],
                message: "invalid confirm password ",
                code: "custom",
            });
        }
    }),
};
exports.resendConfirmEmailOtpSchema = {
    body: zod_1.default.strictObject({
        email: general_validation_js_1.generalValidationFields.email,
    }),
};
exports.confirmEmailSchema = {
    body: exports.resendConfirmEmailOtpSchema.body.safeExtend({
        otp: general_validation_js_1.generalValidationFields.otp,
    }),
};
exports.forgotPasswordSchema = {
    body: zod_1.default.strictObject({
        email: general_validation_js_1.generalValidationFields.email,
    }),
};
exports.resetPasswordSchema = {
    body: zod_1.default.strictObject({
        email: general_validation_js_1.generalValidationFields.email,
        password: general_validation_js_1.generalValidationFields.password,
        otp: general_validation_js_1.generalValidationFields.otp,
    }),
};
