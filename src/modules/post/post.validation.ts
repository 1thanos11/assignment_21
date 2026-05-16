import z from "zod";
import { generalValidationFields } from "../../common/validation/general.validation.js";
import { Types } from "mongoose";

export const createPostSchema = {
  body: z
    .strictObject({
      content: generalValidationFields.content.optional(),
      files: generalValidationFields.postFiles.optional(),
      tags: generalValidationFields.tags.optional(),
      availability: generalValidationFields.availability.optional(),
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
};

//react post
export const reactPostSchema = {
  params: z.strictObject({ postId: generalValidationFields.id }),
  query: z.strictObject({ react: generalValidationFields.react }),
};

//react post GQL
export const reactPostSchemaGQL = z.strictObject({
  postId: generalValidationFields.id,
  react: generalValidationFields.react,
});

//update post
export const updatePostSchema = {
  body: z
    .strictObject({
      content: generalValidationFields.content.optional(),
      removeFiles: generalValidationFields.removeFiles.optional(),
      removeTags: generalValidationFields.removeTags.optional(),
      files: generalValidationFields.postFiles.optional(),
      tags: generalValidationFields.tags.optional(),
      availability: generalValidationFields.availability.optional(),
    })
    .superRefine((fields, ctx) => {
      if (!Object.keys(fields)?.length) {
        ctx.addIssue({
          code: "custom",
          message: "insert data to update",
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
    }),

  params: z.strictObject({
    postId: generalValidationFields.id,
  }),
};
