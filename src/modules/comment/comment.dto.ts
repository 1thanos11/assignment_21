import z from "zod";
import { IAuthDto } from "../user/user.dto.js";
import { createCommentSchema, replySchema } from "./comment.validation.js";

type CreateCommentBodyDto = z.infer<typeof createCommentSchema.body>;
type CreateCommentParamsDto = z.infer<typeof createCommentSchema.params>;
export type CreateCommentDto = CreateCommentBodyDto &
  CreateCommentParamsDto &
  IAuthDto;

export type ReplyBodyDto = z.infer<typeof replySchema.body>;
export type ReplyParamsDto = z.infer<typeof replySchema.params>;
export type ReplyDto = ReplyBodyDto & ReplyParamsDto & IAuthDto;
