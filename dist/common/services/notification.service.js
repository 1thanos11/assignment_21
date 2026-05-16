"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
class NotificationService {
    client;
    constructor() {
        const serviceAccount = JSON.parse((0, node_fs_1.readFileSync)((0, node_path_1.resolve)(`./src/config/social-media-app-62c1b-firebase-adminsdk-fbsvc-4aafee8961.json`)));
        this.client = firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(serviceAccount),
        });
    }
    async sendNotification({ token, data, }) {
        const message = { token, data };
        return await this.client.messaging().send(message);
    }
    async sendMultiNotification({ tokens, data, }) {
        await Promise.allSettled(tokens.map((token) => {
            return this.sendNotification({ token, data });
        }));
    }
}
exports.notificationService = new NotificationService();
