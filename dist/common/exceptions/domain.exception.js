"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenException = exports.UnauthorizedException = exports.ConflictException = exports.BadRequestException = exports.NotFoundException = exports.MapGraphQLError = void 0;
const graphql_1 = require("graphql");
const application_exception_js_1 = require("./application.exception.js");
const MapGraphQLError = (error) => {
    throw new graphql_1.GraphQLError(error.message, {
        extensions: { statusCode: error.statusCode, cause: error.cause },
    });
};
exports.MapGraphQLError = MapGraphQLError;
class NotFoundException extends application_exception_js_1.ApplicationException {
    constructor(message = "not found", cause) {
        super(message, 404, { cause });
    }
}
exports.NotFoundException = NotFoundException;
class BadRequestException extends application_exception_js_1.ApplicationException {
    constructor(message = "bad request", cause) {
        super(message, 400, { cause });
    }
}
exports.BadRequestException = BadRequestException;
class ConflictException extends application_exception_js_1.ApplicationException {
    constructor(message = "conflict data", cause) {
        super(message, 409, { cause });
    }
}
exports.ConflictException = ConflictException;
class UnauthorizedException extends application_exception_js_1.ApplicationException {
    constructor(message = "Unauthorized", cause) {
        super(message, 401, { cause });
    }
}
exports.UnauthorizedException = UnauthorizedException;
class ForbiddenException extends application_exception_js_1.ApplicationException {
    constructor(message = "Forbidden", cause) {
        super(message, 403, { cause });
    }
}
exports.ForbiddenException = ForbiddenException;
