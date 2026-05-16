import type { NextFunction, Request, Response } from "express";
import { Router } from "express";

import { authentication } from "../../middleware/auth.middleware.js";
import { userService } from "./user.service.js";
import { successResponse } from "../../common/response/success.response.js";
import { TokenTypeEnum } from "../../common/enums/security.enums.js";
import { validate } from "../../middleware/validation.middleware.js";
import { logoutSchema, shareProfileSchema } from "./user.validation.js";
import { cloudFileUpload } from "../../common/utils/multer/cloud.multer.js";
import { StorageEnum } from "../../common/enums/multer.enums.js";
import { fileFilterValidation } from "../../common/utils/multer/validation.js";

const router = Router();

//refresh token
router.post(
  "/refresh-token",
  authentication(TokenTypeEnum.REFRESH),
  async (req: Request, res: Response, next: NextFunction) => {
    const { accessToken, refreshToken } = await userService.refreshToken({
      user: req.user,
      decode: req.decode,
    });

    return successResponse({ res, data: { accessToken, refreshToken } });
  },
);

//profile
router.get(
  "/me",
  authentication(),
  async (req: Request, res: Response, next: NextFunction) => {
    const profile = await userService.profile({ user: req.user });

    return successResponse({ res, data: profile });
  },
);

//logout
router.patch(
  "/logout",
  authentication(),
  validate(logoutSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const { flag } = req.body;
    await userService.logout({ user: req.user, decode: req.decode, flag });

    return successResponse({ res, message: "logged out successfully" });
  },
);

//share profile
router.get(
  "/share-profile/:id",
  authentication(),
  validate(shareProfileSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = await userService.shareProfile({ id: id as string });

    return successResponse({ res, data: user });
  },
);

//profile image
router.patch(
  "/profile-image",
  authentication(),
  cloudFileUpload({
    storageDest: StorageEnum.DISK,
    validation: fileFilterValidation.image,
    maxSize: 5,
  }).single("attachment"),
  async (req: Request, res: Response, next: NextFunction) => {
    const { ContentType, Originalname } = req.body;
    const data = await userService.uploadProfileImage({
      user: req.user,
      ContentType,
      Originalname,
    });
    return successResponse({ res, data: data });
  },
);

//cover pictures
router.patch(
  "/cover-images",
  authentication(),
  cloudFileUpload({
    storageDest: StorageEnum.DISK,
    validation: fileFilterValidation.image,
    maxSize: 5,
  }).array("attachments", 4),
  async (req: Request, res: Response, next: NextFunction) => {
    await userService.uploadCoverImages({
      attachments: req.files as Array<Express.Multer.File>,
      user: req.user,
    });

    return successResponse({ res, data: req.file });
  },
);

export default router;
