import z, { email } from "zod";
import { generalValidationFields } from "../../common/validation/general.validation.js";

//login schema
export const loginSchema = {
  body: z.strictObject({
    email: generalValidationFields.email,
    password: generalValidationFields.password,
    FCM: generalValidationFields.FCM.optional(),
  }),
};

//signup schema
export const signupSchema = {
  body: z
    .strictObject({
      email: generalValidationFields.email,
      password: generalValidationFields.password,
      username: generalValidationFields.username,
      confirmPassword: generalValidationFields.confirmPassword,
      phone: generalValidationFields.phone.optional(),
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
  // .refine(
  //   (data) => {
  //     return data.password === data.confirmPassword;
  //   },
  //   { error: "invalid confirm password" },
  // ),// if you need to make one thing
};

//resend confirm email otp schema
export const resendConfirmEmailOtpSchema = {
  body: z.strictObject({
    email: generalValidationFields.email,
  }),
};

//confirm email schema
export const confirmEmailSchema = {
  body: resendConfirmEmailOtpSchema.body.safeExtend({
    otp: generalValidationFields.otp,
  }),
};

//forgot password otp
export const forgotPasswordSchema = {
  body: z.strictObject({
    email: generalValidationFields.email,
  }),
};

//reset password
export const resetPasswordSchema = {
  body: z.strictObject({
    email: generalValidationFields.email,
    password: generalValidationFields.password,
    otp: generalValidationFields.otp,
  }),
};
