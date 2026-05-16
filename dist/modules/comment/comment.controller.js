"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const validation_middleware_js_1 = require("../../middleware/validation.middleware.js");
const cloud_multer_js_1 = require("../../common/utils/multer/cloud.multer.js");
const validation_js_1 = require("../../common/utils/multer/validation.js");
const success_response_js_1 = require("../../common/response/success.response.js");
const comment_validation_js_1 = require("./comment.validation.js");
const comment_service_js_1 = require("./comment.service.js");
const router = (0, express_1.Router)();
router.post("/create/:postId", (0, auth_middleware_js_1.authentication)(), (0, cloud_multer_js_1.cloudFileUpload)({ validation: validation_js_1.fileFilterValidation.image }).array("attachments"), (0, validation_middleware_js_1.validate)(comment_validation_js_1.createCommentSchema), async (req, res, next) => {
    const comment = await comment_service_js_1.commentService.createComment({
        ...req.body,
        ...req.params,
        user: req.user,
        files: req.files,
    });
    return (0, success_response_js_1.successResponse)({ res, status: 201, data: comment });
});
router.post("/post/:postId/comment/:commentId/reply", (0, auth_middleware_js_1.authentication)(), (0, cloud_multer_js_1.cloudFileUpload)({ validation: validation_js_1.fileFilterValidation.image }).array("attachments"), (0, validation_middleware_js_1.validate)(comment_validation_js_1.replySchema), async (req, res, next) => {
    const comment = await comment_service_js_1.commentService.replyOnComment({
        ...req.body,
        ...req.params,
        user: req.user,
        files: req.files,
    });
    return (0, success_response_js_1.successResponse)({ res, status: 201, data: comment });
});
exports.default = router;
