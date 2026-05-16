import { NextFunction, Request, Response, Router } from "express";
import { authentication } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import { createPostSchema } from "./post.validation.js";
import { cloudFileUpload } from "../../common/utils/multer/cloud.multer.js";
import { fileFilterValidation } from "../../common/utils/multer/validation.js";
import { successResponse } from "../../common/response/success.response.js";
import { PostService } from "./post.service.js";
import { ReactPostParamsDto, ReactPostQueryDto } from "./post.dto.js";

const postService = new PostService();

const router = Router();

//create post
router.post(
  "/create-post",
  authentication(),
  cloudFileUpload({ validation: fileFilterValidation.image }).array(
    "attachments",
  ),
  validate(createPostSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const post = await postService.createPost({ ...req.body, user: req.user });
    return successResponse({ res, status: 201, data: post });
  },
);

//posts list
router.get(
  "/list",
  authentication(),
  async (req: Request, res: Response, next: NextFunction) => {
    const posts = await postService.postsList({ user: req.user, ...req.query });

    return successResponse({ res, data: posts });
  },
);

//react post
router.patch(
  "/react/:postId",
  authentication(),
  async (req: Request, res: Response, next: NextFunction) => {
    const posts = await postService.reactPost({
      user: req.user,
      ...(req.query as unknown as ReactPostQueryDto),
      ...(req.params as unknown as ReactPostParamsDto),
    });

    return successResponse({ res, data: posts });
  },
);

//update post
router.patch(
  "/update/:postId",
  authentication(),
  async (req: Request, res: Response, next: NextFunction) => {
    const post = await postService.updatePost({
      user: req.user,
      ...req.body,
      ...req.params,
    });

    return successResponse({ res, data: post });
  },
);
export default router;
