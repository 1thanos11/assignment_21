import { NextFunction, Request, Response, Router } from "express";
import { validate } from "../../middleware/validation.middleware.js";
import { createGroup, getOVOChat } from "./chat.validation.js";
import { chatService } from "./chat.service.js";
import { successResponse } from "../../common/response/success.response.js";
import { authentication } from "../../middleware/auth.middleware.js";
import { cloudFileUpload } from "../../common/utils/multer/cloud.multer.js";
import { fileFilterValidation } from "../../common/utils/multer/validation.js";
import { StorageEnum } from "../../common/enums/multer.enums.js";

const router = Router();

//get chat
router.get(
  "/:participantId/ovo",
  authentication(),
  validate(getOVOChat),
  async (req: Request, res: Response, next: NextFunction) => {
    const chat = await chatService.getOVOChat({
      ...(req.params as { participantId: string }),
      ...req.query,
      user: req.user,
    });

    return successResponse({ res, data: { chat } });
  },
);

//create chat
router.post(
  "/group",
  authentication(),
  cloudFileUpload({
    validation: fileFilterValidation.image,
  }).single("attachment"),
  validate(createGroup),
  async (req: Request, res: Response, next: NextFunction) => {
    const chat = await chatService.createGroup({
      user: req.user,
      ...req.body,
      group_image: req.file,
    });

    return successResponse({ res, status: 201, data: { chat } });
  },
);

export default router;
