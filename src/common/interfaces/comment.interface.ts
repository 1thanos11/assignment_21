import { Types } from "mongoose";
import { IUser } from "./user.interface.js";
import { IPost } from "./post.interface.js";
import { ReactTypeEnum } from "../utils/email/react.enums.js";

export interface IComment {
  content?: string;
  attachments?: string[];

  likes?: Array<{ userId: Types.ObjectId; reactType: ReactTypeEnum }>;
  tags?: Types.ObjectId[] | IUser[];

  postId: Types.ObjectId | IPost;
  commentId: Types.ObjectId | IComment;

  createdBy: Types.ObjectId | IUser;
  updatedBy?: Types.ObjectId | IUser;

  deletedAt?: Date;
  restoredAt?: Date;

  createdAt: Date;
  updatedAt?: Date;
}
