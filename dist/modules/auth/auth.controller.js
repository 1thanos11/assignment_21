"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const success_response_js_1 = require("../../common/response/success.response.js");
const auth_service_js_1 = __importDefault(require("./auth.service.js"));
const auth_validation_js_1 = require("./auth.validation.js");
const validation_middleware_js_1 = require("../../middleware/validation.middleware.js");
const router = (0, express_1.Router)();
router.post("/signup/gmail", async (req, res, next) => {
    const { status, credentials } = await auth_service_js_1.default.signupWithGmail(req.body);
    return (0, success_response_js_1.successResponse)({ res, status, data: credentials });
});
router.post("/login/gmail", async (req, res, next) => {
    const { accessToken, refreshToken } = await auth_service_js_1.default.loginWithGmail(req.body);
    return (0, success_response_js_1.successResponse)({ res, data: { accessToken, refreshToken } });
});
router.post("/signup", (0, validation_middleware_js_1.validate)(auth_validation_js_1.signupSchema), async (req, res, next) => {
    const result = await auth_service_js_1.default.signup(req.body);
    return (0, success_response_js_1.successResponse)({ res, status: 201, data: result });
});
router.post("/resend-confirm-email-otp", (0, validation_middleware_js_1.validate)(auth_validation_js_1.resendConfirmEmailOtpSchema), async (req, res, next) => {
    const { email } = req.body;
    await auth_service_js_1.default.resendConfirmEmailOtp({ email });
    return (0, success_response_js_1.successResponse)({
        res,
        status: 201,
        message: "otp has sent please check your gmail",
    });
});
router.patch("/confirm-email", (0, validation_middleware_js_1.validate)(auth_validation_js_1.confirmEmailSchema), async (req, res, next) => {
    const { email, otp } = req.body;
    await auth_service_js_1.default.confirmEmail({ email, otp });
    return (0, success_response_js_1.successResponse)({ res, message: "email confirmed successfully" });
});
router.post("/login", (0, validation_middleware_js_1.validate)(auth_validation_js_1.loginSchema), async (req, res, next) => {
    const { email, password, FCM } = req.body;
    const { accessToken, refreshToken } = await auth_service_js_1.default.login({
        email,
        password,
        FCM,
    });
    return (0, success_response_js_1.successResponse)({ res, data: { accessToken, refreshToken } });
});
router.post("/forgot-password", (0, validation_middleware_js_1.validate)(auth_validation_js_1.forgotPasswordSchema), async (req, res, next) => {
    const { email } = req.body;
    await auth_service_js_1.default.forgotPassword({ email });
    return (0, success_response_js_1.successResponse)({
        res,
        message: "otp has sent please check your gmail",
    });
});
router.patch("/reset-password", (0, validation_middleware_js_1.validate)(auth_validation_js_1.resetPasswordSchema), async (req, res, next) => {
    const { email, password, otp } = req.body;
    await auth_service_js_1.default.resetPassword({ email, password, otp });
    return (0, success_response_js_1.successResponse)({ res, message: "password reset successfully" });
});
exports.default = router;
