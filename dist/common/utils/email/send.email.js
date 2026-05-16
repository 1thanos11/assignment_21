"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const domain_exception_js_1 = require("../../exceptions/domain.exception.js");
const config_js_1 = require("../../../config/config.js");
const sendEmail = async ({ to, cc, bcc, html, attachments = [], }) => {
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: config_js_1.EMAIL_USER,
            pass: config_js_1.EMAIL_PASS,
        },
    });
    if (!to && !cc && !bcc) {
        throw new domain_exception_js_1.BadRequestException("invalid recipient");
    }
    if (!html?.length && !attachments?.length) {
        throw new domain_exception_js_1.BadRequestException("invalid mail content");
    }
    const info = transporter.sendMail({
        to,
        cc,
        bcc,
        html,
        attachments,
        from: `${config_js_1.APPLICATION_NAME} ${config_js_1.EMAIL_USER}`,
    });
    console.log("mail sent", (await info).messageId);
};
exports.sendEmail = sendEmail;
