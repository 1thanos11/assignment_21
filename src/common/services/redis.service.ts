import type { RedisClientType } from "redis";
import { createClient } from "redis";

import { REDIS_URI } from "../../config/config.js";
import { Types } from "mongoose";
import { EmailEnum } from "../enums/email.enums.js";

type OtpKeyType = { email: string; subject?: EmailEnum };

class RedisService {
  private client: RedisClientType;
  constructor() {
    this.client = createClient({ url: REDIS_URI });
    this.eventsHandler();
  }
  //event handler
  private eventsHandler() {
    this.client.on("connect", () =>
      console.log(`REDIS_DB Connected Successfully`),
    );
    this.client.on("error", (error) =>
      console.log(`REDIS_DB Connection Failed`),
    );
  }
  //connect
  async connect() {
    await this.client.connect();
  }

  //** keys */
  //**Revoke Token Keys
  //base revoke token
  baseRevokeToken({ userId }: { userId: Types.ObjectId | string }): string {
    return `Auth::RevokeToken::${userId}`;
  }
  //revoke token
  revokeTokenKey({
    userId,
    jti,
  }: {
    userId: Types.ObjectId | string;
    jti: string;
  }): string {
    return `${this.baseRevokeToken({ userId })}::${jti}`;
  }

  //**otp keys
  //otp key
  otpKey({ email, subject = EmailEnum.CONFIRM_EMAIL }: OtpKeyType): string {
    return `Auth::OTP::${email}::${subject}`;
  }
  //otp max attempts key
  otpMaxAttemptsKey({
    email,
    subject = EmailEnum.CONFIRM_EMAIL,
  }: OtpKeyType): string {
    return `${this.otpKey({ email, subject })}::MaxTrial`;
  }
  //otp block key
  OtpBlockKey({
    email,
    subject = EmailEnum.CONFIRM_EMAIL,
  }: OtpKeyType): string {
    return `${this.otpKey({ email, subject })}::Block`;
  }

  //** Methods */
  //set
  async set({
    key,
    value,
    time = undefined,
  }: {
    key: string;
    value: any;
    time?: number | undefined;
  }): Promise<any> {
    try {
      value = typeof value === "string" ? value : JSON.stringify(value);
      return time
        ? await this.client.set(key, value, { EX: time })
        : await this.client.set(key, value);
    } catch (error) {
      console.log("fail in redis set operation");
    }
  }
  //get
  //     async get({ key }: { key: string }): Promise<string | number | null> {
  //     try {
  //       const value = await this.client.get(key);
  //       try {
  //         return JSON.parse(value as string);
  //       } catch (error) {
  //         return isNaN(Number(value)) ? value : Number(value);
  //       }
  //     } catch (error) {
  //       console.log(`fail in redis get operation`);
  //       return null;
  //     }
  //   }
  async get<T = unknown>({ key }: { key: string }): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      return value as T;
    }
  }
  //del
  async del({ keys }: { keys: string | string[] }): Promise<number | null> {
    try {
      if (!keys?.length) {
        return 0;
      }
      return await this.client.del(keys);
    } catch (error) {
      console.log(`fail in redis del operation`);
      return null;
    }
  }
  //keys
  async keys({ pattern }: { pattern: string }): Promise<string[]> {
    try {
      return await this.client.keys(`${pattern}`);
    } catch (error) {
      console.log(`fail in redis keys operation`);
      return [];
    }
  }
  //ttl
  async ttl({ key }: { key: string }): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.log(`fail in redis ttl operation`);
      return -2;
    }
  }
  //incr
  async incr({ key }: { key: string }): Promise<number | undefined> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      console.log(`fail in redis incr operation`);
      return;
    }
  }

  //FCM
  FCMKey(userId: Types.ObjectId | string) {
    return `User::FCM::${userId.toString()}`;
  }
  //add fcm
  async addFCM({
    userId,
    FCMToken,
  }: {
    userId: Types.ObjectId | string;
    FCMToken: string;
  }) {
    return await this.client.sAdd(this.FCMKey(userId), FCMToken);
  }
  //remove fcm
  async removeFCM({
    userId,
    FCMToken,
  }: {
    userId: Types.ObjectId | string;
    FCMToken: string;
  }) {
    return await this.client.sRem(this.FCMKey(userId), FCMToken);
  }
  //get fcm
  async getFCMs({ userId }: { userId: Types.ObjectId | string }) {
    return await this.client.sMembers(this.FCMKey(userId));
  }
  //has fcm
  async hasFCMs({
    userId,
    FCMToken,
  }: {
    userId: Types.ObjectId | string;
    FCMToken: string;
  }) {
    return await this.client.sCard(this.FCMKey(userId));
  }
  //remove fcm user
  async removeFCMsUser({
    userId,
    FCMToken,
  }: {
    userId: Types.ObjectId | string;
    FCMToken: string;
  }) {
    return await this.client.del(this.FCMKey(userId));
  }

  //socket.io
  socketKey(userId: Types.ObjectId | string) {
    return `user:sockets:${userId}`;
  }
  async addSocket(userId: Types.ObjectId | string, socketId: string) {
    return await this.client.sAdd(this.socketKey(userId), socketId);
  }
  async removeSocket(userId: Types.ObjectId | string, socketId: string) {
    return await this.client.sRem(this.socketKey(userId), socketId);
  }
  async getSockets(userId: Types.ObjectId | string) {
    return await this.client.sMembers(this.socketKey(userId));
  }
  async hasSockets(userId: Types.ObjectId | string) {
    return await this.client.sCard(this.socketKey(userId));
  }
  async removeUser(userId: Types.ObjectId | string) {
    return await this.client.del(this.socketKey(userId));
  }
}

export const redisService = new RedisService();
