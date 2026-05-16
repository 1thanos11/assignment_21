import { Types } from "mongoose";
import { AvailabilityEnum } from "../enums/post.enums.js";
import { ReactTypeEnum } from "../utils/email/react.enums.js";

export interface IPost {
  folderId: string;
  content?: string;
  attachments?: Array<string>;
  likes: Array<{ userId: Types.ObjectId; reactType: ReactTypeEnum }>;
  tags?: Array<Types.ObjectId>;
  availability?: AvailabilityEnum;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  exceptedFor?: Array<Types.ObjectId>;
  deletedAt?: Date;
  restoredAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
