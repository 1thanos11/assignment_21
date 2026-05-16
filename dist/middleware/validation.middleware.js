"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketValidate = exports.GQLValidate = exports.validate = void 0;
const domain_exception_js_1 = require("../common/exceptions/domain.exception.js");
const validate = (schema) => {
    return (req, res, next) => {
        const issues = [];
        for (const key of Object.keys(schema)) {
            if (!schema[key])
                continue;
            if (req.file) {
                req.body = { ...req.body, file: req.file };
            }
            if (req.files) {
                req.body = { ...req.body, files: req.files };
            }
            const validationResult = schema[key].safeParse(req[key]);
            if (!validationResult.success) {
                const error = validationResult.error;
                issues.push({
                    key,
                    issues: error.issues.map((issue) => {
                        return { path: issue.path, message: issue.message };
                    }),
                });
            }
        }
        if (issues.length) {
            throw new domain_exception_js_1.BadRequestException("Validation Error", { issues });
        }
        next();
    };
};
exports.validate = validate;
const GQLValidate = async (schema, args) => {
    const validationResult = schema.safeParse(args);
    if (!validationResult.success) {
        throw (0, domain_exception_js_1.MapGraphQLError)(new domain_exception_js_1.BadRequestException("Validation error", {
            issues: validationResult.error.issues.map((issue) => {
                return { path: issue.path, message: issue.message };
            }),
        }));
    }
    return true;
};
exports.GQLValidate = GQLValidate;
const SocketValidate = async (schema, args) => {
    const validationResult = schema.safeParse(args);
    if (!validationResult.success) {
        throw new domain_exception_js_1.BadRequestException("Validation error", {
            issues: validationResult.error.issues.map((issue) => {
                return { path: issue.path, message: issue.message };
            }),
        });
    }
    return true;
};
exports.SocketValidate = SocketValidate;
