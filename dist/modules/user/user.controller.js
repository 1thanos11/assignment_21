"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const user_service_js_1 = require("./user.service.js");
const success_response_js_1 = require("../../common/response/success.response.js");
const security_enums_js_1 = require("../../common/enums/security.enums.js");
const validation_middleware_js_1 = require("../../middleware/validation.middleware.js");
const user_validation_js_1 = require("./user.validation.js");
const cloud_multer_js_1 = require("../../common/utils/multer/cloud.multer.js");
const multer_enums_js_1 = require("../../common/enums/multer.enums.js");
const validation_js_1 = require("../../common/utils/multer/validation.js");
const router = (0, express_1.Router)();
router.post("/refresh-token", (0, auth_middleware_js_1.authentication)(security_enums_js_1.TokenTypeEnum.REFRESH), async (req, res, next) => {
    const { accessToken, refreshToken } = await user_service_js_1.userService.refreshToken({
        user: req.user,
        decode: req.decode,
    });
    return (0, success_response_js_1.successResponse)({ res, data: { accessToken, refreshToken } });
});
router.get("/me", (0, auth_middleware_js_1.authentication)(), async (req, res, next) => {
    const profile = await user_service_js_1.userService.profile({ user: req.user });
    return (0, success_response_js_1.successResponse)({ res, data: profile });
});
router.patch("/logout", (0, auth_middleware_js_1.authentication)(), (0, validation_middleware_js_1.validate)(user_validation_js_1.logoutSchema), async (req, res, next) => {
    const { flag } = req.body;
    await user_service_js_1.userService.logout({ user: req.user, decode: req.decode, flag });
    return (0, success_response_js_1.successResponse)({ res, message: "logged out successfully" });
});
router.get("/share-profile/:id", (0, auth_middleware_js_1.authentication)(), (0, validation_middleware_js_1.validate)(user_validation_js_1.shareProfileSchema), async (req, res, next) => {
    const { id } = req.params;
    const user = await user_service_js_1.userService.shareProfile({ id: id });
    return (0, success_response_js_1.successResponse)({ res, data: user });
});
router.patch("/profile-image", (0, auth_middleware_js_1.authentication)(), (0, cloud_multer_js_1.cloudFileUpload)({
    storageDest: multer_enums_js_1.StorageEnum.DISK,
    validation: validation_js_1.fileFilterValidation.image,
    maxSize: 5,
}).single("attachment"), async (req, res, next) => {
    const { ContentType, Originalname } = req.body;
    const data = await user_service_js_1.userService.uploadProfileImage({
        user: req.user,
        ContentType,
        Originalname,
    });
    return (0, success_response_js_1.successResponse)({ res, data: data });
});
router.patch("/cover-images", (0, auth_middleware_js_1.authentication)(), (0, cloud_multer_js_1.cloudFileUpload)({
    storageDest: multer_enums_js_1.StorageEnum.DISK,
    validation: validation_js_1.fileFilterValidation.image,
    maxSize: 5,
}).array("attachments", 4), async (req, res, next) => {
    await user_service_js_1.userService.uploadCoverImages({
        attachments: req.files,
        user: req.user,
    });
    return (0, success_response_js_1.successResponse)({ res, data: req.file });
});
exports.default = router;
