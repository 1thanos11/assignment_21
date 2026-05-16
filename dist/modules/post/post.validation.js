"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePostSchema = exports.reactPostSchemaGQL = exports.reactPostSchema = exports.createPostSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const general_validation_js_1 = require("../../common/validation/general.validation.js");
const mongoose_1 = require("mongoose");
exports.createPostSchema = {
    body: zod_1.default
        .strictObject({
        content: general_validation_js_1.generalValidationFields.content.optional(),
        files: general_validation_js_1.generalValidationFields.postFiles.optional(),
        tags: general_validation_js_1.generalValidationFields.tags.optional(),
        availability: general_validation_js_1.generalValidationFields.availability.optional(),
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
            for (const tag of fields.tags) {
                if (!mongoose_1.Types.ObjectId.isValid(tag)) {
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
exports.reactPostSchema = {
    params: zod_1.default.strictObject({ postId: general_validation_js_1.generalValidationFields.id }),
    query: zod_1.default.strictObject({ react: general_validation_js_1.generalValidationFields.react }),
};
exports.reactPostSchemaGQL = zod_1.default.strictObject({
    postId: general_validation_js_1.generalValidationFields.id,
    react: general_validation_js_1.generalValidationFields.react,
});
exports.updatePostSchema = {
    body: zod_1.default
        .strictObject({
        content: general_validation_js_1.generalValidationFields.content.optional(),
        removeFiles: general_validation_js_1.generalValidationFields.removeFiles.optional(),
        removeTags: general_validation_js_1.generalValidationFields.removeTags.optional(),
        files: general_validation_js_1.generalValidationFields.postFiles.optional(),
        tags: general_validation_js_1.generalValidationFields.tags.optional(),
        availability: general_validation_js_1.generalValidationFields.availability.optional(),
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
    params: zod_1.default.strictObject({
        postId: general_validation_js_1.generalValidationFields.id,
    }),
};
