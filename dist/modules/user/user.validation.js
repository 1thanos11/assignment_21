"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.coverImagesSchema = exports.profileImageSchema = exports.shareProfileSchema = exports.logoutSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const general_validation_js_1 = require("../../common/validation/general.validation.js");
exports.logoutSchema = {
    body: zod_1.default.strictObject({
        flag: general_validation_js_1.generalValidationFields.flag,
    }),
};
exports.shareProfileSchema = {
    params: zod_1.default.strictObject({
        id: general_validation_js_1.generalValidationFields.id,
    }),
};
exports.profileImageSchema = {
    body: zod_1.default.strictObject({
        ContentType: general_validation_js_1.generalValidationFields.ContentType,
        Originalname: general_validation_js_1.generalValidationFields.originalname,
    }),
};
exports.coverImagesSchema = {
    files: zod_1.default.strictObject({
        attachments: general_validation_js_1.generalValidationFields.files,
    }),
};
