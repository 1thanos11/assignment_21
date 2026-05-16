import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { successResponse } from "../../common/response/success.response.js";
import authService from "./auth.service.js";
import {
  confirmEmailSchema,
  forgotPasswordSchema,
  loginSchema,
  resendConfirmEmailOtpSchema,
  resetPasswordSchema,
  signupSchema,
} from "./auth.validation.js";
import { validate } from "../../middleware/validation.middleware.js";
import { auth } from "google-auth-library";

const router = Router();

//signup with gmail
router.post(
  "/signup/gmail",
  async (req: Request, res: Response, next: NextFunction) => {
    const { status, credentials } = await authService.signupWithGmail(req.body);

    return successResponse({ res, status, data: credentials });
  },
);

//login with gmail
router.post(
  "/login/gmail",
  async (req: Request, res: Response, next: NextFunction) => {
    const { accessToken, refreshToken } = await authService.loginWithGmail(
      req.body,
    );

    return successResponse({ res, data: { accessToken, refreshToken } });
  },
);

//signup
router.post(
  "/signup",
  validate(signupSchema),
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const result = await authService.signup(req.body);

    return successResponse({ res, status: 201, data: result });
  },
);

//resend confirm email otp
router.post(
  "/resend-confirm-email-otp",
  validate(resendConfirmEmailOtpSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    await authService.resendConfirmEmailOtp({ email });

    return successResponse({
      res,
      status: 201,
      message: "otp has sent please check your gmail",
    });
  },
);

//confirm email
router.patch(
  "/confirm-email",
  validate(confirmEmailSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp } = req.body;
    await authService.confirmEmail({ email, otp });

    return successResponse({ res, message: "email confirmed successfully" });
  },
);

//login
router.post(
  "/login",
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, FCM } = req.body;
    const { accessToken, refreshToken } = await authService.login({
      email,
      password,
      FCM,
    });

    return successResponse({ res, data: { accessToken, refreshToken } });
  },
);

//forgot password
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    await authService.forgotPassword({ email });

    return successResponse({
      res,
      message: "otp has sent please check your gmail",
    });
  },
);

//reset password
router.patch(
  "/reset-password",
  validate(resetPasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, otp } = req.body;
    await authService.resetPassword({ email, password, otp });

    return successResponse({ res, message: "password reset successfully" });
  },
);

export default router;
