"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRepository = void 0;
const chat_model_js_1 = require("../models/chat.model.js");
const base_repository_js_1 = require("./base.repository.js");
class ChatRepository extends base_repository_js_1.DataBaseRepository {
    constructor() {
        super(chat_model_js_1.Chat);
    }
    async findOneChat({ filter, options, page = 1, size = 5, }) {
        const doc = await this.model.findOne(filter, {
            messages: { $slice: [-(page * size), size] },
        }, options);
        return doc;
    }
}
exports.ChatRepository = ChatRepository;
