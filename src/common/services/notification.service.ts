import admin from "firebase-admin";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

class NotificationService {
  private client: admin.app.App;
  constructor() {
    const serviceAccount = JSON.parse(
      readFileSync(
        resolve(
          `./src/config/social-media-app-62c1b-firebase-adminsdk-fbsvc-4aafee8961.json`,
        ),
      ) as unknown as string,
    );
    this.client = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  //send notification
  async sendNotification({
    token,
    data,
  }: {
    token: string;
    data: { title: string; body: string };
  }): Promise<string> {
    const message = { token, data };

    return await this.client.messaging().send(message);
  }

  //send multi notification
  async sendMultiNotification({
    tokens,
    data,
  }: {
    tokens: Array<string>;
    data: { title: string; body: string };
  }) {
    await Promise.allSettled(
      tokens.map((token) => {
        return this.sendNotification({ token, data });
      }),
    );
  }
}

export const notificationService = new NotificationService();
