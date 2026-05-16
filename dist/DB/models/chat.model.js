"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = void 0;
const mongoose_1 = require("mongoose");
const domain_exception_js_1 = require("../../common/exceptions/domain.exception.js");
const chat_enums_js_1 = require("../../common/enums/chat.enums.js");
const messageSchema = new mongoose_1.Schema({
    content: { type: String, minlength: 2, maxlength: 500000 },
    attachments: [String],
    likes: { type: [mongoose_1.Types.ObjectId], ref: "User" },
    tags: { type: [mongoose_1.Types.ObjectId], ref: "User" },
    createdBy: { type: mongoose_1.Types.ObjectId, ref: "User" },
});
const chatSchema = new mongoose_1.Schema({
    chatType: { type: String, enum: chat_enums_js_1.ChatTypeEnum, required: true },
    participants: { type: [mongoose_1.Types.ObjectId], ref: "User", required: true },
    messages: [messageSchema],
    group_name: {
        type: String,
        required: function () {
            return this.chatType === chat_enums_js_1.ChatTypeEnum.OVM;
        },
    },
    group_image: String,
    roomId: {
        type: String,
        required: function () {
            return this.chatType === chat_enums_js_1.ChatTypeEnum.OVM;
        },
    },
    deletedAt: Date,
    restoredAt: Date,
}, {
    timestamps: true,
});
messageSchema.pre("validate", function () {
    if (!this.content && (!this.attachments || this.attachments.length === 0)) {
        throw new domain_exception_js_1.BadRequestException("message can't be empty");
    }
});
exports.Chat = (0, mongoose_1.model)("Chat", chatSchema);
