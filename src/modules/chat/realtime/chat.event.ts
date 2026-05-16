import { redisService } from "../../../common/services/redis.service.js";
import { IAuthSocket } from "../../../common/types/socket.types.js";
import { SocketValidate } from "../../../middleware/validation.middleware.js";
import { chatService, ChatService } from "../chat.service.js";
import * as validators from "../chat.validation.js";

export class ChatEvent {
  private chatService: ChatService;
  private redis = redisService;
  constructor() {
    this.chatService = chatService;
  }

  //events
  sendMessage = (socket: IAuthSocket) => {
    return socket.on(
      "sendMessage",
      async ({ content, sendTo }: { content: string; sendTo: string }) => {
        try {
          await SocketValidate<{ content: string; sendTo: string }>(
            validators.sendMessage,
            { content, sendTo },
          );
          await this.chatService.sendMessage({
            content,
            sendTo,
            user: socket.data.user,
          });
          socket.emit("successMessage", { content });
          socket
            .to((await this.redis.getSockets(sendTo)) as string[])
            .emit("newMessage", { content, from: socket.data.user });
        } catch (error) {
          socket.emit("custom_error", error);
        }
      },
    );
  };
}

export const chatEvent = new ChatEvent();
