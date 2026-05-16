import { NextFunction, Request, Response, Router } from "express";
import { authentication } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import { cloudFileUpload } from "../../common/utils/multer/cloud.multer.js";
import { fileFilterValidation } from "../../common/utils/multer/validation.js";
import { successResponse } from "../../common/response/success.response.js";
import { createCommentSchema, replySchema } from "./comment.validation.js";
import { commentService } from "./comment.service.js";

const router = Router();

//create post
router.post(
  "/create/:postId",
  authentication(),
  cloudFileUpload({ validation: fileFilterValidation.image }).array(
    "attachments",
  ),
  validate(createCommentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const comment = await commentService.createComment({
      ...req.body,
      ...req.params,
      user: req.user,
      files: req.files,
    });
    return successResponse({ res, status: 201, data: comment });
  },
);

//reply
router.post(
  "/post/:postId/comment/:commentId/reply",
  authentication(),
  cloudFileUpload({ validation: fileFilterValidation.image }).array(
    "attachments",
  ),
  validate(replySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const comment = await commentService.replyOnComment({
      ...req.body,
      ...req.params,
      user: req.user,
      files: req.files,
    });
    return successResponse({ res, status: 201, data: comment });
  },
);

export default router;
