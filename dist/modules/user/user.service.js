"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const security_enums_js_1 = require("../../common/enums/security.enums.js");
const domain_exception_js_1 = require("../../common/exceptions/domain.exception.js");
const redis_service_js_1 = require("../../common/services/redis.service.js");
const s3_service_js_1 = require("../../common/services/s3.service.js");
const security_service_js_1 = require("../../common/services/security.service.js");
const token_service_js_1 = require("../../common/services/token.service.js");
const config_js_1 = require("../../config/config.js");
const user_repository_js_1 = require("../../DB/repository/user.repository.js");
class UserService {
    userRepository;
    securityService;
    tokenService;
    redis;
    s3;
    constructor(userRepository = new user_repository_js_1.UserRepository(), securityService = new security_service_js_1.SecurityService(), tokenService = new token_service_js_1.TokenService(), redis = redis_service_js_1.redisService, s3 = s3_service_js_1.s3Service) {
        this.userRepository = userRepository;
        this.securityService = securityService;
        this.tokenService = tokenService;
        this.redis = redis;
        this.s3 = s3;
    }
    async refreshToken(inputs) {
        const { user, decode } = inputs;
        const userId = user._id.toString();
        if (Date.now() + 30000 <
            (decode?.iat + config_js_1.JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN) * 1000) {
            throw new domain_exception_js_1.ConflictException("previous token is still valid");
        }
        const revokeTokenKey = this.redis.revokeTokenKey({
            userId,
            jti: decode?.jti,
        });
        await this.redis.set({
            key: revokeTokenKey,
            value: decode?.jti,
            time: decode?.iat + config_js_1.JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
        });
        return await this.tokenService.createLoginCredentials({ user });
    }
    async profile(inputs) {
        const { user } = inputs;
        const profile = await this.userRepository.findOne({
            filter: { _id: user._id },
            options: {
                populate: [
                    {
                        path: "friends",
                        select: "firstName lastName username profilePicture",
                    },
                ],
            },
        });
        if (!profile) {
            throw new domain_exception_js_1.NotFoundException("user not found");
        }
        if (profile.phone) {
            profile.phone = await this.securityService.decrypt({
                encryptedData: profile.phone,
            });
        }
        return profile.toJSON();
    }
    async logout(inputs) {
        const { user, decode, flag } = inputs;
        switch (flag) {
            case security_enums_js_1.LogoutEnum.ALL:
                user.changeCredentialsTime = new Date();
                await user.save();
                const keys = await this.redis.keys({
                    pattern: `${this.redis.baseRevokeToken({
                        userId: user._id,
                    })}*`,
                });
                await this.redis.del({ keys });
                break;
            default:
                const revokeTokenKey = this.redis.revokeTokenKey({
                    userId: user._id,
                    jti: decode?.jti,
                });
                await this.redis.set({
                    key: revokeTokenKey,
                    value: decode?.jti,
                    time: decode?.iat + config_js_1.JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
                });
                break;
        }
        return;
    }
    async shareProfile(inputs) {
        const { id } = inputs;
        const targetUser = await this.userRepository.findOne({
            filter: { _id: id, confirmEmail: { $exists: true } },
            projection: "-email -password -confirmEmail -role -provider -changeCredentialsTime -_id -updatedAt -__v",
        });
        if (!targetUser) {
            throw new domain_exception_js_1.NotFoundException("user not found");
        }
        if (targetUser.phone) {
            targetUser.phone = await this.securityService.decrypt({
                encryptedData: targetUser.phone,
            });
        }
        return targetUser;
    }
    async uploadProfileImage(inputs) {
        const { user, ContentType, Originalname } = inputs;
        const oldPic = user.profilePicture;
        const { url, Key } = await this.s3.createPreSignedUploadUrl({
            path: `Users/${user._id.toString()}/Profile`,
            ContentType,
            Originalname,
        });
        user.profilePicture = Key;
        await user.save();
        if (oldPic) {
            await this.s3.deleteAsset({ Key: oldPic });
        }
        return { url, Key };
    }
    async uploadCoverImages(inputs) {
        const { user, attachments } = inputs;
        const oldUrls = user.coverPictures;
        const urls = await this.s3.uploadAssets({
            files: attachments,
            path: `Users/${user._id.toString()}/Profile/Cover`,
        });
        user.coverPictures = urls;
        await user.save();
        if (oldUrls?.length) {
            await this.s3.deleteAssets({
                Keys: oldUrls.map((ele) => {
                    return { Key: ele };
                }),
            });
        }
        return;
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
