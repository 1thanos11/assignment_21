"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGroup = exports.getOVOChat = exports.sendMessage = void 0;
const zod_1 = __importDefault(require("zod"));
const general_validation_js_1 = require("../../common/validation/general.validation.js");
exports.sendMessage = zod_1.default.strictObject({
    content: zod_1.default.string().min(2),
    sendTo: zod_1.default.string(),
});
exports.getOVOChat = {
    params: zod_1.default.strictObject({
        participantId: general_validation_js_1.generalValidationFields.id,
    }),
    query: zod_1.default.strictObject({
        page: zod_1.default.coerce.number().optional(),
        size: zod_1.default.coerce.number().optional(),
    }),
};
exports.createGroup = {
    body: zod_1.default.strictObject({
        participantsIds: zod_1.default.array(general_validation_js_1.generalValidationFields.id),
        group_name: zod_1.default.string(),
        group_image: general_validation_js_1.generalValidationFields.file.optional(),
    }),
};
