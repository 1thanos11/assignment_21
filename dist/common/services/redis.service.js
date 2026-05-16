"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisService = void 0;
const redis_1 = require("redis");
const config_js_1 = require("../../config/config.js");
const email_enums_js_1 = require("../enums/email.enums.js");
class RedisService {
    client;
    constructor() {
        this.client = (0, redis_1.createClient)({ url: config_js_1.REDIS_URI });
        this.eventsHandler();
    }
    eventsHandler() {
        this.client.on("connect", () => console.log(`REDIS_DB Connected Successfully`));
        this.client.on("error", (error) => console.log(`REDIS_DB Connection Failed`));
    }
    async connect() {
        await this.client.connect();
    }
    baseRevokeToken({ userId }) {
        return `Auth::RevokeToken::${userId}`;
    }
    revokeTokenKey({ userId, jti, }) {
        return `${this.baseRevokeToken({ userId })}::${jti}`;
    }
    otpKey({ email, subject = email_enums_js_1.EmailEnum.CONFIRM_EMAIL }) {
        return `Auth::OTP::${email}::${subject}`;
    }
    otpMaxAttemptsKey({ email, subject = email_enums_js_1.EmailEnum.CONFIRM_EMAIL, }) {
        return `${this.otpKey({ email, subject })}::MaxTrial`;
    }
    OtpBlockKey({ email, subject = email_enums_js_1.EmailEnum.CONFIRM_EMAIL, }) {
        return `${this.otpKey({ email, subject })}::Block`;
    }
    async set({ key, value, time = undefined, }) {
        try {
            value = typeof value === "string" ? value : JSON.stringify(value);
            return time
                ? await this.client.set(key, value, { EX: time })
                : await this.client.set(key, value);
        }
        catch (error) {
            console.log("fail in redis set operation");
        }
    }
    async get({ key }) {
        const value = await this.client.get(key);
        if (!value)
            return null;
        try {
            return JSON.parse(value);
        }
        catch (error) {
            return value;
        }
    }
    async del({ keys }) {
        try {
            if (!keys?.length) {
                return 0;
            }
            return await this.client.del(keys);
        }
        catch (error) {
            console.log(`fail in redis del operation`);
            return null;
        }
    }
    async keys({ pattern }) {
        try {
            return await this.client.keys(`${pattern}`);
        }
        catch (error) {
            console.log(`fail in redis keys operation`);
            return [];
        }
    }
    async ttl({ key }) {
        try {
            return await this.client.ttl(key);
        }
        catch (error) {
            console.log(`fail in redis ttl operation`);
            return -2;
        }
    }
    async incr({ key }) {
        try {
            return await this.client.incr(key);
        }
        catch (error) {
            console.log(`fail in redis incr operation`);
            return;
        }
    }
    FCMKey(userId) {
        return `User::FCM::${userId.toString()}`;
    }
    async addFCM({ userId, FCMToken, }) {
        return await this.client.sAdd(this.FCMKey(userId), FCMToken);
    }
    async removeFCM({ userId, FCMToken, }) {
        return await this.client.sRem(this.FCMKey(userId), FCMToken);
    }
    async getFCMs({ userId }) {
        return await this.client.sMembers(this.FCMKey(userId));
    }
    async hasFCMs({ userId, FCMToken, }) {
        return await this.client.sCard(this.FCMKey(userId));
    }
    async removeFCMsUser({ userId, FCMToken, }) {
        return await this.client.del(this.FCMKey(userId));
    }
    socketKey(userId) {
        return `user:sockets:${userId}`;
    }
    async addSocket(userId, socketId) {
        return await this.client.sAdd(this.socketKey(userId), socketId);
    }
    async removeSocket(userId, socketId) {
        return await this.client.sRem(this.socketKey(userId), socketId);
    }
    async getSockets(userId) {
        return await this.client.sMembers(this.socketKey(userId));
    }
    async hasSockets(userId) {
        return await this.client.sCard(this.socketKey(userId));
    }
    async removeUser(userId) {
        return await this.client.del(this.socketKey(userId));
    }
}
exports.redisService = new RedisService();
