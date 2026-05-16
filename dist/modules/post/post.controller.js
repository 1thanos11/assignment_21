"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const validation_middleware_js_1 = require("../../middleware/validation.middleware.js");
const post_validation_js_1 = require("./post.validation.js");
const cloud_multer_js_1 = require("../../common/utils/multer/cloud.multer.js");
const validation_js_1 = require("../../common/utils/multer/validation.js");
const success_response_js_1 = require("../../common/response/success.response.js");
const post_service_js_1 = require("./post.service.js");
const postService = new post_service_js_1.PostService();
const router = (0, express_1.Router)();
router.post("/create-post", (0, auth_middleware_js_1.authentication)(), (0, cloud_multer_js_1.cloudFileUpload)({ validation: validation_js_1.fileFilterValidation.image }).array("attachments"), (0, validation_middleware_js_1.validate)(post_validation_js_1.createPostSchema), async (req, res, next) => {
    const post = await postService.createPost({ ...req.body, user: req.user });
    return (0, success_response_js_1.successResponse)({ res, status: 201, data: post });
});
router.get("/list", (0, auth_middleware_js_1.authentication)(), async (req, res, next) => {
    const posts = await postService.postsList({ user: req.user, ...req.query });
    return (0, success_response_js_1.successResponse)({ res, data: posts });
});
router.patch("/react/:postId", (0, auth_middleware_js_1.authentication)(), async (req, res, next) => {
    const posts = await postService.reactPost({
        user: req.user,
        ...req.query,
        ...req.params,
    });
    return (0, success_response_js_1.successResponse)({ res, data: posts });
});
router.patch("/update/:postId", (0, auth_middleware_js_1.authentication)(), async (req, res, next) => {
    const post = await postService.updatePost({
        user: req.user,
        ...req.body,
        ...req.params,
    });
    return (0, success_response_js_1.successResponse)({ res, data: post });
});
exports.default = router;
