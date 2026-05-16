import type { Server } from "socket.io";
import { IAuthSocket } from "../../../common/types/socket.types.js";
import { ChatEvent, chatEvent } from "./chat.event.js";

export class ChatGateWay {
  private chatEvent: ChatEvent;
  constructor() {
    this.chatEvent = chatEvent;
  }

  //register events
  registerEvents = (socket: IAuthSocket, io: Server) => {
    this.chatEvent.sendMessage(socket);
  };
}

export const chatGateWay = new ChatGateWay();
