"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = void 0;
const mongoose_1 = require("mongoose");
const react_enums_js_1 = require("../../common/utils/email/react.enums.js");
const commentSchema = new mongoose_1.Schema({
    content: {
        type: String,
        required: function () {
            return !this.attachments?.length;
        },
    },
    attachments: [String],
    likes: [
        {
            userId: {
                type: mongoose_1.Types.ObjectId,
                ref: "User",
            },
            reactType: { type: Number, enum: react_enums_js_1.ReactTypeEnum },
        },
    ],
    tags: [mongoose_1.Types.ObjectId],
    postId: { type: mongoose_1.Types.ObjectId, ref: "Post" },
    commentId: { type: mongoose_1.Types.ObjectId, ref: "Comment" },
    createdBy: { type: mongoose_1.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose_1.Types.ObjectId, ref: "User" },
    deletedAt: Date,
    restoredAt: Date,
}, {
    timestamps: true,
});
commentSchema.virtual("reply", {
    localField: "_id",
    foreignField: "commentId",
    ref: "Comment",
    justOne: true,
});
exports.Comment = (0, mongoose_1.model)("Comment", commentSchema);
