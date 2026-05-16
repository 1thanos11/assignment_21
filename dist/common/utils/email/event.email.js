"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMailEvent = void 0;
const node_events_1 = require("node:events");
const send_email_js_1 = require("./send.email.js");
exports.sendMailEvent = new node_events_1.EventEmitter();
exports.sendMailEvent.on("sendMail", async ({ to, cc, bcc, html, attachments }) => {
    try {
        await (0, send_email_js_1.sendEmail)({ to, cc, bcc, html, attachments });
    }
    catch (error) {
        console.log(`fail to send email => : `, error);
    }
});
