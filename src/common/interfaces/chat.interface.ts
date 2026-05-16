import { Types } from "mongoose";
import { IUser } from "./user.interface.js";
import { ChatTypeEnum } from "../enums/chat.enums.js";

export interface IMessage {
  content?: string;
  attachments?: Array<string>;
  likes?: Array<Types.ObjectId> | Array<IUser>;
  tags?: Array<Types.ObjectId> | Array<IUser>;
  createdBy?: Types.ObjectId | IUser;
}

export interface IChat {
  chatType: ChatTypeEnum;
  participants: Array<Types.ObjectId> | Array<IUser>;
  messages: Array<IMessage>;
  //OVM
  group_name?: string;
  group_image?: string;
  roomId?: string;

  deletedAt?: Date;
  restoredAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
