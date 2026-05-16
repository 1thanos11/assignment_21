import express from "express";
import cors from "cors";
import { createHandler } from "graphql-http/lib/use/express";

import { s3Service } from "./common/services/s3.service.js";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import { successResponse } from "./common/response/success.response.js";
import { postRouter } from "./modules/post/index.js";
import { GlobalErrorHandler } from "./middleware/error.middleware.js";
import connectDB from "./DB/connect.db.js";
import { redisService } from "./common/services/redis.service.js";
import {
  authRouter,
  commentRouter,
  realTimeGateWay,
  userRouter,
} from "./modules/index.js";
import { PORT } from "./config/config.js";
import { schema } from "./modules/graphql/schema.gql.js";
import { authentication } from "./middleware/auth.middleware.js";
import { TokenService } from "./common/services/token.service.js";
import { Server } from "socket.io";
import { Socket } from "socket.io";
import type { Server as HttpServer } from "node:http";
import { IAuthSocket } from "./common/types/socket.types.js";
import { chatRouter } from "./modules/chat/index.js";

const s3WriteStream = promisify(pipeline);

async function bootstrap() {
  await connectDB();
  await redisService.connect();

  const app: express.Express = express();
  app.use(cors(), express.json());

  //routs
  app.use("/api/auth", authRouter);
  app.use("/api/user", userRouter);
  app.use("/api/post", postRouter);
  app.use("/api/comment", commentRouter);
  app.use("/api/chat", chatRouter);

  app.all(
    "/graphql",
    createHandler({
      schema,
      context: async (req) => {
        const tokenService = new TokenService();

        try {
          let user = null;
          let decode = null;

          const authorization = req.raw.headers.authorization;

          if (authorization?.startsWith("Bearer ")) {
            const [, token] = authorization.split(" ");

            const result = await tokenService.decodeToken({
              token: token as string,
            });

            user = result.user;
            decode = result.decode;
          }

          return { user, decode };
        } catch (error) {
          return {
            user: null,
            decode: null,
          };
        }
      },
    }),
  );
  //get asset
  app.get(
    "upload/*path",
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      const { download, fileName } = req.query;
      const { path } = req.params as { path: Array<string> };
      const Key = path.join("/");
      const { Body, ContentType } = await s3Service.getAsset({ Key });
      res.setHeader("Content-Type", ContentType || "application/octet-stream");
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
      if (download === "true") {
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${fileName || Key.split("/").pop()}"`,
        );
      }

      return await s3WriteStream(Body as NodeJS.ReadableStream, res);
    },
  );

  //fetch presigned link
  app.get(
    "uploads/*path",
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      const { download, fileName } = req.query as {
        download: string;
        fileName: string;
      };
      const { path } = req.params as { path: Array<string> };
      const Key = path.join("/");
      const url = await s3Service.createPreSignedUrlFetchLink({
        Key,
        download,
        fileName,
      });

      return successResponse({ res, data: { url } });
    },
  );

  //handle not found pages
  app.get(
    "/*dummy",
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ): express.Response => {
      return res.status(404).json({ message: "Invalid application routing" });
    },
  );

  //error handler
  app.use(GlobalErrorHandler);

  const httpServer: HttpServer = app.listen(PORT, () => {
    console.log(`Server Is Running On PORT ${PORT}`);
  });

  realTimeGateWay.initializeIo(httpServer);
}

export default bootstrap;
