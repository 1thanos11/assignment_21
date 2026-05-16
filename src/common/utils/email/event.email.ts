import { EventEmitter } from "node:events";

import Mail from "nodemailer/lib/mailer/index.js";
import { sendEmail } from "./send.email.js";

export const sendMailEvent = new EventEmitter();

//send mail event
sendMailEvent.on(
  "sendMail",
  async ({ to, cc, bcc, html, attachments }: Mail.Options) => {
    try {
      await sendEmail({ to, cc, bcc, html, attachments });
    } catch (error) {
      console.log(`fail to send email => : `, error);
    }
  },
);
