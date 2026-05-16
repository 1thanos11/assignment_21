"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalErrorHandler = void 0;
const config_js_1 = require("../config/config.js");
const GlobalErrorHandler = (error, req, res, next) => {
    if (error.name === "MulterError") {
        error.statusCode = 400;
    }
    res.status(error.statusCode || 500).json({
        success: false,
        status: error.statusCode,
        msg: error.message || "internal server error",
        stack: config_js_1.NODE_ENV === "dev" ? error.stack : undefined,
        cause: error.cause,
        error: config_js_1.NODE_ENV === "dev" ? error : undefined,
    });
};
exports.GlobalErrorHandler = GlobalErrorHandler;
