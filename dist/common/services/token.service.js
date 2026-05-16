"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_js_1 = require("../../config/config.js");
const node_crypto_1 = require("node:crypto");
const domain_exception_js_1 = require("../exceptions/domain.exception.js");
const redis_service_js_1 = require("./redis.service.js");
const user_repository_js_1 = require("../../DB/repository/user.repository.js");
const security_enums_js_1 = require("../enums/security.enums.js");
const user_enums_js_1 = require("../enums/user.enums.js");
class TokenService {
    redis = redis_service_js_1.redisService;
    userRepository;
    constructor() {
        this.userRepository = new user_repository_js_1.UserRepository();
    }
    async detectTokenSignatureLevel({ role, }) {
        let accessSignature;
        let refreshSignature;
        switch (role) {
            case user_enums_js_1.RoleEnum.ADMIN:
                accessSignature = config_js_1.JWT_CONFIG.ADMIN.ACCESS_SECRET;
                refreshSignature = config_js_1.JWT_CONFIG.ADMIN.REFRESH_SECRET;
                break;
            default:
                accessSignature = config_js_1.JWT_CONFIG.User.ACCESS_SECRET;
                refreshSignature = config_js_1.JWT_CONFIG.User.REFRESH_SECRET;
                break;
        }
        return { accessSignature, refreshSignature };
    }
    async getTokenSignature({ tokenType = security_enums_js_1.TokenTypeEnum.ACCESS, role, }) {
        const { accessSignature, refreshSignature } = await this.detectTokenSignatureLevel({ role });
        return tokenType === security_enums_js_1.TokenTypeEnum.REFRESH
            ? refreshSignature
            : accessSignature;
    }
    async sign({ payload, secret = config_js_1.JWT_CONFIG.User.ACCESS_SECRET, options, }) {
        return jsonwebtoken_1.default.sign(payload, secret, options);
    }
    async verify({ token, secret = config_js_1.JWT_CONFIG.User.ACCESS_SECRET, options, }) {
        return jsonwebtoken_1.default.verify(token, secret, options);
    }
    async createLoginCredentials({ user, issuer = config_js_1.JWT_CONFIG.ISSUER, }) {
        const { accessSignature, refreshSignature } = await this.detectTokenSignatureLevel({
            role: user.role,
        });
        const jwtid = (0, node_crypto_1.randomUUID)();
        const accessToken = await this.sign({
            payload: { sub: user._id },
            secret: accessSignature,
            options: {
                expiresIn: config_js_1.JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
                jwtid,
                issuer,
                audience: [
                    security_enums_js_1.TokenTypeEnum.ACCESS,
                    user.role,
                ],
            },
        });
        const refreshToken = await this.sign({
            payload: { sub: user._id },
            secret: refreshSignature,
            options: {
                expiresIn: config_js_1.JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
                jwtid,
                issuer,
                audience: [
                    security_enums_js_1.TokenTypeEnum.REFRESH,
                    user.role,
                ],
            },
        });
        return { accessToken, refreshToken };
    }
    async decodeToken({ token, tokenType = security_enums_js_1.TokenTypeEnum.ACCESS, }) {
        if (!token) {
            throw new domain_exception_js_1.BadRequestException(`no token passed`);
        }
        const decode = jsonwebtoken_1.default.decode(token);
        if (!decode?.aud?.length) {
            throw new domain_exception_js_1.UnauthorizedException("Missing token audience");
        }
        if (decode.iss !== config_js_1.JWT_CONFIG.ISSUER) {
            throw new domain_exception_js_1.UnauthorizedException("jwt issuer invalid");
        }
        const [tokenTypeAud, userRole] = decode.aud;
        if (tokenType !== tokenTypeAud) {
            throw new domain_exception_js_1.BadRequestException("invalid token type");
        }
        const secret = await this.getTokenSignature({
            tokenType,
            role: userRole,
        });
        const verifiedData = await this.verify({
            token,
            secret,
            options: { issuer: config_js_1.JWT_CONFIG.ISSUER },
        });
        const user = await this.userRepository.findOne({
            filter: { _id: verifiedData.sub, confirmEmail: { $exists: true } },
        });
        if (!user) {
            throw new domain_exception_js_1.UnauthorizedException("please register or confirm your email first");
        }
        const revokeTokenKey = this.redis.revokeTokenKey({
            userId: verifiedData.sub,
            jti: decode.jti,
        });
        const isLogoutFromToken = await this.redis.get({ key: revokeTokenKey });
        if (isLogoutFromToken) {
            throw new domain_exception_js_1.BadRequestException("please login first");
        }
        if (user.changeCredentialsTime &&
            decode.iat * 1000 + 1000 <
                user.changeCredentialsTime.getTime()) {
            throw new domain_exception_js_1.BadRequestException("please login first");
        }
        return { user, decode };
    }
}
exports.TokenService = TokenService;
