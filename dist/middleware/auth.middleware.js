"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GQLAuthorization = exports.authorization = exports.authentication = void 0;
const security_enums_js_1 = require("../common/enums/security.enums.js");
const domain_exception_js_1 = require("../common/exceptions/domain.exception.js");
const token_service_js_1 = require("../common/services/token.service.js");
const authentication = (tokenType = security_enums_js_1.TokenTypeEnum.ACCESS) => {
    return async (req, res, next) => {
        const tokenService = new token_service_js_1.TokenService();
        if (!req.headers.authorization) {
            throw new domain_exception_js_1.BadRequestException("not token passed");
        }
        const [flag, token] = req.headers.authorization.split(" ");
        if (!token) {
            throw new domain_exception_js_1.BadRequestException("no token passed");
        }
        const { user, decode } = await tokenService.decodeToken({
            token,
            tokenType,
        });
        req.user = user;
        req.decode = decode;
        next();
    };
};
exports.authentication = authentication;
const authorization = (allowedRoles) => {
    return async (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            throw new domain_exception_js_1.ForbiddenException("you are not authorize to access this end point");
        }
        next();
    };
};
exports.authorization = authorization;
const GQLAuthorization = (allowedRoles, user) => {
    if (!allowedRoles.includes(user.role)) {
        throw (0, domain_exception_js_1.MapGraphQLError)(new domain_exception_js_1.ForbiddenException("you are not authorize to access this end point"));
    }
};
exports.GQLAuthorization = GQLAuthorization;
