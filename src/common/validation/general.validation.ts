import z from "zod";
import { LogoutEnum } from "../enums/security.enums.js";
import { Types } from "mongoose";
import { GenderEnum } from "../enums/user.enums.js";
import { AvailabilityEnum } from "../enums/post.enums.js";
import { ReactTypeEnum } from "../utils/email/react.enums.js";

export const generalValidationFields = {
  username: z
    .string({ error: "username must be string" })
    .min(1, { error: "username can't be less than 1" })
    .max(15, { error: "username can't be exceed 15" }),
  confirmPassword: z.string(),
  email: z.email({ error: "enter valid email format" }),
  password: z.string({ error: "password must be string" }),
  phone: z.string(),
  gender: z.enum(GenderEnum).default(GenderEnum.MALE),
  DOB: z.date(),
  otp: z.coerce.number().int().min(100000).max(999999),
  flag: z.enum(LogoutEnum).default(LogoutEnum.ONE),
  id: z.string().refine(
    (val) => {
      return Types.ObjectId.isValid(val);
    },
    {
      error: "invalid id",
    },
  ),
  file: z.custom<Express.Multer.File>((file) => {
    return (
      typeof file === "object" &&
      file !== null &&
      "mimetype" in file &&
      "size" in file
    );
  }, "Invalid file"),
  files: z.custom<Express.Multer.File[]>((files) => {
    if (!Array.isArray(files)) return false;

    return files.every((file) => {
      return (
        typeof file === "object" &&
        file !== null &&
        "mimetype" in file &&
        "size" in file
      );
    });
  }, "Invalid files"),
  ContentType: z.string(),
  originalname: z.string(),
  FCM: z.string(),
  content: z.string(),
  postFiles: z.array(z.any()),
  tags: z.array(z.string()),
  availability: z.enum(AvailabilityEnum).default(AvailabilityEnum.PUBLIC),
  react: z.enum(ReactTypeEnum),
  removeFiles: z.array(z.string()),
  removeTags: z.array(z.string()),
};

//paginate
export const paginateSchema = {
  query: z.strictObject({
    page: z.coerce.number().optional(),
    size: z.coerce.number().optional(),
    search: z.string().min(2).optional(),
  }),
};

//paginate dto
export type PaginateDto = z.infer<typeof paginateSchema.query>;
