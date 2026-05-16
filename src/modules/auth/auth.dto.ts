import z from "zod";

import {
  confirmEmailSchema,
  forgotPasswordSchema,
  loginSchema,
  resendConfirmEmailOtpSchema,
  resetPasswordSchema,
  signupSchema,
} from "./auth.validation.js";

export type LoginDto = z.infer<typeof loginSchema.body>;
export type SignupDto = z.infer<typeof signupSchema.body>;
export type ResendConfirmEmailOtpDto = z.infer<
  typeof resendConfirmEmailOtpSchema.body
>;
export type ConfirmEmailDto = z.infer<typeof confirmEmailSchema.body>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema.body>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema.body>;
