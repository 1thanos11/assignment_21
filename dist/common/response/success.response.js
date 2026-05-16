"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = void 0;
const successResponse = ({ res, status = 200, message = "Success", data, }) => {
    return res.status(status).json({ success: true, status, message, data });
};
exports.successResponse = successResponse;
