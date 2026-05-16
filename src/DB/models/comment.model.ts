import { model, Schema, Types } from "mongoose";
import { IComment } from "../../common/interfaces/comment.interface.js";
import { ReactTypeEnum } from "../../common/utils/email/react.enums.js";

const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: function (this) {
        return !this.attachments?.length;
      },
    },
    attachments: [String],
    likes: [
      {
        userId: {
          type: Types.ObjectId,
          ref: "User",
        },
        reactType: { type: Number, enum: ReactTypeEnum },
      },
    ],
    tags: [Types.ObjectId],
    postId: { type: Types.ObjectId, ref: "Post" },
    commentId: { type: Types.ObjectId, ref: "Comment" },
    createdBy: { type: Types.ObjectId, ref: "User" },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    deletedAt: Date,
    restoredAt: Date,
  },
  {
    timestamps: true,
  },
);

commentSchema.virtual("reply", {
  localField: "_id",
  foreignField: "commentId",
  ref: "Comment",
  justOne: true,
});

export const Comment = model<IComment>("Comment", commentSchema);
