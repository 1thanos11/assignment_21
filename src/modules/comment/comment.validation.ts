import z from "zod";
import { generalValidationFields } from "../../common/validation/general.validation.js";
import { Types } from "mongoose";

export const createCommentSchema = {
  body: z
    .strictObject({
      content: generalValidationFields.content.optional(),
      files: generalValidationFields.postFiles.optional(),
      tags: generalValidationFields.tags.optional(),
    })
    .superRefine((fields, ctx) => {
      if (!fields.content && !fields.files?.length) {
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: "content is required",
        });
      }

      if (fields.tags?.length) {
        const uniqueTags = [...new Set(fields.tags)];
        if (uniqueTags.length < fields.tags.length) {
          ctx.addIssue({
            code: "custom",
            path: ["tags"],
            message: "Tags must be unique",
          });
        }
      }

      if (fields.tags?.length) {
        for (const tag of fields.tags as any) {
          if (!Types.ObjectId.isValid(tag)) {
            ctx.addIssue({
              code: "custom",
              path: ["tags"],
              message: "invalid tag format",
            });
          }
        }
      }
    }),
  params: z.strictObject({ postId: generalValidationFields.id }),
};

//reply on comment
export const replySchema = {
  body: createCommentSchema.body,
  params: createCommentSchema.params.safeExtend({
    commentId: generalValidationFields.id,
  }),
};
