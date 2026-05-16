"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatEvent = exports.ChatEvent = void 0;
const redis_service_js_1 = require("../../../common/services/redis.service.js");
const validation_middleware_js_1 = require("../../../middleware/validation.middleware.js");
const chat_service_js_1 = require("../chat.service.js");
const validators = __importStar(require("../chat.validation.js"));
class ChatEvent {
    chatService;
    redis = redis_service_js_1.redisService;
    constructor() {
        this.chatService = chat_service_js_1.chatService;
    }
    sendMessage = (socket) => {
        return socket.on("sendMessage", async ({ content, sendTo }) => {
            try {
                await (0, validation_middleware_js_1.SocketValidate)(validators.sendMessage, { content, sendTo });
                await this.chatService.sendMessage({
                    content,
                    sendTo,
                    user: socket.data.user,
                });
                socket.emit("successMessage", { content });
                socket
                    .to((await this.redis.getSockets(sendTo)))
                    .emit("newMessage", { content, from: socket.data.user });
            }
            catch (error) {
                socket.emit("custom_error", error);
            }
        });
    };
}
exports.ChatEvent = ChatEvent;
exports.chatEvent = new ChatEvent();
