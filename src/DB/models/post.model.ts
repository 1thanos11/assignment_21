import { HydratedDocument, model, models, Types } from "mongoose";
import { Schema } from "mongoose";
import { IPost } from "../../common/interfaces/post.interface.js";
import { ReactTypeEnum } from "../../common/utils/email/react.enums.js";
import { AvailabilityEnum } from "../../common/enums/post.enums.js";


const postSchema = new Schema<HydratedDocument<IPost>>(
  {
    folderId: { type: String, required: true },
    content: {
      type: String,
      required: function (this) {
        return !this.attachments || this.attachments.length === 0;
      },
    },
    attachments: { type: [String] },
    likes: [
      {
        userId: { type: Types.ObjectId, ref: "User" },

        reactType: { type: Number, enum: ReactTypeEnum },
      },
    ],
    tags: { type: [Types.ObjectId], ref: "User" },
    availability: {
      type: Number,
      enum: AvailabilityEnum,
      default: AvailabilityEnum.PUBLIC,
    },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    exceptedFor: [{ type: Types.ObjectId, ref: "User" }],
    deletedAt: Date,
    restoredAt: Date,
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

postSchema.virtual("comments", {
  localField: "_id",
  foreignField: "postId",
  ref: "Comment",
  justOne: true,
});

postSchema.pre(["findOne", "find"], function () {
  const query = this.getQuery();
  if (query.paranoid === false) {
  } else {
    this.setQuery({ ...query, deletedAt: { $exists: false } });
  }
});

postSchema.pre(["updateOne", "findOneAndUpdate"], function () {
  const update = this.getUpdate() as HydratedDocument<IPost>;
  if (update.deletedAt) {
    this.setUpdate({ ...update, $unset: { restoredAt: 1 } });
  }
  if (update.restoredAt) {
    this.setUpdate({ ...update, $unset: { deletedAt: 1 } });
    this.setQuery({ ...this.getQuery(), deletedAt: { $exists: true } });
  }
  const query = this.getQuery();
  if (query.paranoid === false) {
  } else {
    this.setQuery({ deletedAt: { $exists: false }, ...query });
  }
});

postSchema.pre(["deleteOne", "findOneAndDelete"], function () {
  const query = this.getQuery();
  if (query.force === true) {
  } else {
    this.setQuery({ deletedAt: { $exists: true }, ...query });
  }
});

export const Post =
  models.Post || model<HydratedDocument<IPost>>("Post", postSchema);
