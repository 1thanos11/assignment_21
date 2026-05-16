import { Types } from "mongoose";
import { ChatRepository } from "../../DB/repository/chat.repository.js";
import { CreateGroupDto, GetOVOChatDto, SendMessageDto } from "./chat.dto.js";
import { NotFoundException } from "../../common/exceptions/domain.exception.js";
import { UserRepository } from "../../DB/repository/user.repository.js";
import { ChatTypeEnum } from "../../common/enums/chat.enums.js";
import { IChat } from "../../common/interfaces/chat.interface.js";
import { s3Service } from "../../common/services/s3.service.js";
import { randomUUID } from "node:crypto";

export class ChatService {
  private chatRepo: ChatRepository;
  private userRepo: UserRepository;
  private s3 = s3Service;
  constructor() {
    this.chatRepo = new ChatRepository();
    this.userRepo = new UserRepository();
  }

  //RestFullAPIs
  async getOVOChat(inputs: GetOVOChatDto): Promise<any> {
    const { user, participantId, page, size } = inputs;
    const chat = await this.chatRepo.findOneChat({
      page: page as number,
      size: size as number,
      filter: {
        participants: {
          $all: [user._id, Types.ObjectId.createFromHexString(participantId)],
        },
      },
      options: { populate: [{ path: "participants" }] },
    });
    if (!chat) {
      return null;
    }

    return chat;
  }

  //send message
  async sendMessage(inputs: SendMessageDto): Promise<IChat> {
    const { user, content, sendTo } = inputs;
    const friend = await this.userRepo.findOne({
      filter: { _id: sendTo, friends: { $in: [user._id] } },
    });
    if (!friend) {
      throw new NotFoundException("User not found");
    }
    let chat = await this.chatRepo.findOneAndUpdate({
      filter: { participants: { $all: [user._id, friend._id] } },
      update: { $addToSet: { messages: { content, createdBy: user._id } } },
    });
    if (!chat) {
      chat = await this.chatRepo.createOne({
        data: {
          chatType: ChatTypeEnum.OVO,
          participants: [user._id, friend._id],
          messages: [{ content, createdBy: user._id }],
        },
      });
    }

    return chat.toJSON();
  }

  //create group
  async createGroup(inputs: CreateGroupDto): Promise<any> {
    const { user, participantsIds, group_name, group_image } = inputs;
    const roomId = randomUUID();
    let uploadedGroupImageUrl: string | undefined = undefined;
    if (group_image) {
      uploadedGroupImageUrl = await this.s3.uploadAsset({
        file: group_image as Express.Multer.File,
        path: `Chat/${roomId}`,
      });
    }
    const participants = participantsIds.map((ele) =>
      Types.ObjectId.createFromHexString(ele),
    );
    const chat = await this.chatRepo.createOne({
      data: {
        chatType: ChatTypeEnum.OVM,
        participants,
        group_name,
        roomId,
        ...(uploadedGroupImageUrl
          ? { group_image: uploadedGroupImageUrl }
          : {}),
      },
    });

    return chat;
  }
}

export const chatService = new ChatService();
