"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validation_middleware_js_1 = require("../../middleware/validation.middleware.js");
const chat_validation_js_1 = require("./chat.validation.js");
const chat_service_js_1 = require("./chat.service.js");
const success_response_js_1 = require("../../common/response/success.response.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const cloud_multer_js_1 = require("../../common/utils/multer/cloud.multer.js");
const validation_js_1 = require("../../common/utils/multer/validation.js");
const router = (0, express_1.Router)();
router.get("/:participantId/ovo", (0, auth_middleware_js_1.authentication)(), (0, validation_middleware_js_1.validate)(chat_validation_js_1.getOVOChat), async (req, res, next) => {
    const chat = await chat_service_js_1.chatService.getOVOChat({
        ...req.params,
        ...req.query,
        user: req.user,
    });
    return (0, success_response_js_1.successResponse)({ res, data: { chat } });
});
router.post("/group", (0, auth_middleware_js_1.authentication)(), (0, cloud_multer_js_1.cloudFileUpload)({
    validation: validation_js_1.fileFilterValidation.image,
}).single("attachment"), (0, validation_middleware_js_1.validate)(chat_validation_js_1.createGroup), async (req, res, next) => {
    const chat = await chat_service_js_1.chatService.createGroup({
        user: req.user,
        ...req.body,
        group_image: req.file,
    });
    return (0, success_response_js_1.successResponse)({ res, status: 201, data: { chat } });
});
exports.default = router;
