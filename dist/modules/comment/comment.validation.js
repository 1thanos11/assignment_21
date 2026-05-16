"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.replySchema = exports.createCommentSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const general_validation_js_1 = require("../../common/validation/general.validation.js");
const mongoose_1 = require("mongoose");
exports.createCommentSchema = {
    body: zod_1.default
        .strictObject({
        content: general_validation_js_1.generalValidationFields.content.optional(),
        files: general_validation_js_1.generalValidationFields.postFiles.optional(),
        tags: general_validation_js_1.generalValidationFields.tags.optional(),
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
    params: zod_1.default.strictObject({ postId: general_validation_js_1.generalValidationFields.id }),
};
exports.replySchema = {
    body: exports.createCommentSchema.body,
    params: exports.createCommentSchema.params.safeExtend({
        commentId: general_validation_js_1.generalValidationFields.id,
    }),
};
