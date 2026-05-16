import z from "zod";
import {
  createPostSchema,
  reactPostSchema,
  reactPostSchemaGQL,
  updatePostSchema,
} from "./post.validation.js";
import { IAuthDto } from "../user/user.dto.js";
import { PaginateDto } from "../../common/validation/general.validation.js";

export type CreatePostDto = z.infer<typeof createPostSchema.body> & IAuthDto;
export type PostsListDto = PaginateDto & IAuthDto;
export type ReactPostQueryDto = z.infer<typeof reactPostSchema.query>;
export type ReactPostParamsDto = z.infer<typeof reactPostSchema.params>;
export type ReactPostDto = ReactPostQueryDto & ReactPostParamsDto & IAuthDto;
export type ReactPostArgsDto = z.infer<typeof reactPostSchemaGQL>
export type UpdatePostBodyDto = z.infer<typeof updatePostSchema.body>;
export type UpdatePostParamsDto = z.infer<typeof updatePostSchema.params>;
export type UpdatePostDto = UpdatePostBodyDto & UpdatePostParamsDto & IAuthDto;
