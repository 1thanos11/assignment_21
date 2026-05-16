import { HydratedDocument } from "mongoose";
import { IUser } from "../../common/interfaces/user.interface.js";
import z from "zod";
import {
  coverImagesSchema,
  logoutSchema,
  profileImageSchema,
  shareProfileSchema,
} from "./user.validation.js";
import { JwtPayload } from "jsonwebtoken";

//user dto
export interface IAuthDto {
  user: HydratedDocument<IUser>;
  decode?: JwtPayload;
}

//logout dto
export type LogoutDto = z.infer<typeof logoutSchema.body>;

//share profile dto
export type ShareProfileDto = z.infer<typeof shareProfileSchema.params>;

//profile image
export type ProfileImageDto = z.infer<typeof profileImageSchema.body> &
  IAuthDto;

//cover images
export type CoverImagesDto = z.infer<typeof coverImagesSchema.files> & IAuthDto;
