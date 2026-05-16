"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatService = exports.ChatService = void 0;
const mongoose_1 = require("mongoose");
const chat_repository_js_1 = require("../../DB/repository/chat.repository.js");
const domain_exception_js_1 = require("../../common/exceptions/domain.exception.js");
const user_repository_js_1 = require("../../DB/repository/user.repository.js");
const chat_enums_js_1 = require("../../common/enums/chat.enums.js");
const s3_service_js_1 = require("../../common/services/s3.service.js");
const node_crypto_1 = require("node:crypto");
class ChatService {
    chatRepo;
    userRepo;
    s3 = s3_service_js_1.s3Service;
    constructor() {
        this.chatRepo = new chat_repository_js_1.ChatRepository();
        this.userRepo = new user_repository_js_1.UserRepository();
    }
    async getOVOChat(inputs) {
        const { user, participantId, page, size } = inputs;
        const chat = await this.chatRepo.findOneChat({
            page: page,
            size: size,
            filter: {
                participants: {
                    $all: [user._id, mongoose_1.Types.ObjectId.createFromHexString(participantId)],
                },
            },
            options: { populate: [{ path: "participants" }] },
        });
        if (!chat) {
            return null;
        }
        return chat;
    }
    async sendMessage(inputs) {
        const { user, content, sendTo } = inputs;
        const friend = await this.userRepo.findOne({
            filter: { _id: sendTo, friends: { $in: [user._id] } },
        });
        if (!friend) {
            throw new domain_exception_js_1.NotFoundException("User not found");
        }
        let chat = await this.chatRepo.findOneAndUpdate({
            filter: { participants: { $all: [user._id, friend._id] } },
            update: { $addToSet: { messages: { content, createdBy: user._id } } },
        });
        if (!chat) {
            chat = await this.chatRepo.createOne({
                data: {
                    chatType: chat_enums_js_1.ChatTypeEnum.OVO,
                    participants: [user._id, friend._id],
                    messages: [{ content, createdBy: user._id }],
                },
            });
        }
        return chat.toJSON();
    }
    async createGroup(inputs) {
        const { user, participantsIds, group_name, group_image } = inputs;
        const roomId = (0, node_crypto_1.randomUUID)();
        let uploadedGroupImageUrl = undefined;
        if (group_image) {
            uploadedGroupImageUrl = await this.s3.uploadAsset({
                file: group_image,
                path: `Chat/${roomId}`,
            });
        }
        const participants = participantsIds.map((ele) => mongoose_1.Types.ObjectId.createFromHexString(ele));
        const chat = await this.chatRepo.createOne({
            data: {
                chatType: chat_enums_js_1.ChatTypeEnum.OVM,
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
exports.ChatService = ChatService;
exports.chatService = new ChatService();
