import z from "zod";
import { createGroup, getOVOChat, sendMessage } from "./chat.validation.js";
import { IAuthDto } from "../user/user.dto.js";

export type GetOVOChatParamsDto = z.infer<typeof getOVOChat.params>;
export type GetOVOChatQueryDto = z.infer<typeof getOVOChat.query>;
export type GetOVOChatDto = GetOVOChatParamsDto & GetOVOChatQueryDto & IAuthDto;

export type SendMessageDto = z.infer<typeof sendMessage> & IAuthDto;

export type CreateGroupDto = z.infer<typeof createGroup.body> & IAuthDto;
