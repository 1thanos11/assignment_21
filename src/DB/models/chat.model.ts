import { model, Schema, Types } from "mongoose";
import { IChat, IMessage } from "../../common/interfaces/chat.interface.js";
import { BadRequestException } from "../../common/exceptions/domain.exception.js";
import { ChatTypeEnum } from "../../common/enums/chat.enums.js";

const messageSchema = new Schema<IMessage>({
  content: { type: String, minlength: 2, maxlength: 500000 },
  attachments: [String],
  likes: { type: [Types.ObjectId], ref: "User" },
  tags: { type: [Types.ObjectId], ref: "User" },
  createdBy: { type: Types.ObjectId, ref: "User" },
});

const chatSchema = new Schema<IChat>(
  {
    chatType: { type: String, enum: ChatTypeEnum, required: true },
    participants: { type: [Types.ObjectId], ref: "User", required: true },
    messages: [messageSchema],
    group_name: {
      type: String,
      required: function (this) {
        return this.chatType === ChatTypeEnum.OVM;
      },
    },
    group_image: String,
    roomId: {
      type: String,
      required: function (this) {
        return this.chatType === ChatTypeEnum.OVM;
      },
    },
    deletedAt: Date,
    restoredAt: Date,
  },
  {
    timestamps: true,
  },
);

//before validate
messageSchema.pre("validate", function () {
  if (!this.content && (!this.attachments || this.attachments.length === 0)) {
    throw new BadRequestException("message can't be empty");
  }
});

export const Chat = model<IChat>("Chat", chatSchema);
