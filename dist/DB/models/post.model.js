"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = void 0;
const mongoose_1 = require("mongoose");
const mongoose_2 = require("mongoose");
const react_enums_js_1 = require("../../common/utils/email/react.enums.js");
const post_enums_js_1 = require("../../common/enums/post.enums.js");
const postSchema = new mongoose_2.Schema({
    folderId: { type: String, required: true },
    content: {
        type: String,
        required: function () {
            return !this.attachments || this.attachments.length === 0;
        },
    },
    attachments: { type: [String] },
    likes: [
        {
            userId: { type: mongoose_1.Types.ObjectId, ref: "User" },
            reactType: { type: Number, enum: react_enums_js_1.ReactTypeEnum },
        },
    ],
    tags: { type: [mongoose_1.Types.ObjectId], ref: "User" },
    availability: {
        type: Number,
        enum: post_enums_js_1.AvailabilityEnum,
        default: post_enums_js_1.AvailabilityEnum.PUBLIC,
    },
    createdBy: { type: mongoose_1.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose_1.Types.ObjectId, ref: "User" },
    exceptedFor: [{ type: mongoose_1.Types.ObjectId, ref: "User" }],
    deletedAt: Date,
    restoredAt: Date,
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
postSchema.virtual("comments", {
    localField: "_id",
    foreignField: "postId",
    ref: "Comment",
    justOne: true,
});
postSchema.pre(["findOne", "find"], function () {
    const query = this.getQuery();
    if (query.paranoid === false) {
    }
    else {
        this.setQuery({ ...query, deletedAt: { $exists: false } });
    }
});
postSchema.pre(["updateOne", "findOneAndUpdate"], function () {
    const update = this.getUpdate();
    if (update.deletedAt) {
        this.setUpdate({ ...update, $unset: { restoredAt: 1 } });
    }
    if (update.restoredAt) {
        this.setUpdate({ ...update, $unset: { deletedAt: 1 } });
        this.setQuery({ ...this.getQuery(), deletedAt: { $exists: true } });
    }
    const query = this.getQuery();
    if (query.paranoid === false) {
    }
    else {
        this.setQuery({ deletedAt: { $exists: false }, ...query });
    }
});
postSchema.pre(["deleteOne", "findOneAndDelete"], function () {
    const query = this.getQuery();
    if (query.force === true) {
    }
    else {
        this.setQuery({ deletedAt: { $exists: true }, ...query });
    }
});
exports.Post = mongoose_1.models.Post || (0, mongoose_1.model)("Post", postSchema);
