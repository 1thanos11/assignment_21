import { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { IAuthSocket } from "../../common/types/socket.types.js";
import { TokenService } from "../../common/services/token.service.js";
import { redisService } from "../../common/services/redis.service.js";
import { chatGateWay } from "../chat/index.js";

export class RealtimeGateWay {
  private io!: Server;
  private tokenService: TokenService;
  private redis = redisService;
  private chatGateWay = chatGateWay;
  constructor() {
    this.tokenService = new TokenService();
  }
  // authentication = async (socket: IAuthSocket, next: any) => {
  //   try {
  //     const { user, decode } = await this.tokenService.decodeToken({
  //       token:
  //         socket.handshake.auth.authorization ||
  //         socket.handshake.headers.authorization,
  //     });
  //     socket.data = { user, decode };
  //     await this.redis.addSocket(user._id, socket.id);

  //     next();
  //   } catch (error) {
  //     next(error);
  //   }
  // };
  authentication = async (socket: IAuthSocket, next: any) => {
    try {
      const authorization = socket.handshake.auth.authorization;

      if (!authorization) {
        return next(new Error("No authorization token"));
      }

      if (!authorization.startsWith("Bearer ")) {
        return next(new Error("Invalid token format"));
      }

      const token = authorization.split(" ")[1];

      const { user, decode } = await this.tokenService.decodeToken({
        token,
      });

      socket.data = { user, decode };

      await this.redis.addSocket(user._id, socket.id);

      next();
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  initializeIo = (httpServer: HttpServer) => {
    this.io = new Server(httpServer, {
      cors: {
        origin: "http://127.0.0.1:5500",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });
    this.io.of("/").use(this.authentication);
    this.io.on("connection", (socket: IAuthSocket) => {
      this.chatGateWay.registerEvents(socket, this.io);
      socket.on("disconnect", async () => {
        const connections = await this.redis.getSockets(socket.data.user._id);
        await this.redis.removeSocket(socket.data.user._id, socket.id);
        if (connections.length < 1) {
          this.io.emit("offline_user", { userId: socket.data.user._id });
        }
      });
    });
  };
}

export const realTimeGateWay = new RealtimeGateWay();
