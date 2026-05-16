"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatGateWay = exports.ChatGateWay = void 0;
const chat_event_js_1 = require("./chat.event.js");
class ChatGateWay {
    chatEvent;
    constructor() {
        this.chatEvent = chat_event_js_1.chatEvent;
    }
    registerEvents = (socket, io) => {
        this.chatEvent.sendMessage(socket);
    };
}
exports.ChatGateWay = ChatGateWay;
exports.chatGateWay = new ChatGateWay();
