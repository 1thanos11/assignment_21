import z from "zod";
import { generalValidationFields } from "../../common/validation/general.validation.js";

export const sendMessage = z.strictObject({
  content: z.string().min(2),
  sendTo: z.string(),
});

export const getOVOChat = {
  params: z.strictObject({
    participantId: generalValidationFields.id,
  }),
  query: z.strictObject({
    page: z.coerce.number().optional(),
    size: z.coerce.number().optional(),
  }),
};

export const createGroup = {
  body: z.strictObject({
    participantsIds: z.array(generalValidationFields.id),
    group_name: z.string(),
    group_image: generalValidationFields.file.optional(),
  }),
};
