"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.realTimeGateWay = exports.RealtimeGateWay = void 0;
const socket_io_1 = require("socket.io");
const token_service_js_1 = require("../../common/services/token.service.js");
const redis_service_js_1 = require("../../common/services/redis.service.js");
const index_js_1 = require("../chat/index.js");
class RealtimeGateWay {
    io;
    tokenService;
    redis = redis_service_js_1.redisService;
    chatGateWay = index_js_1.chatGateWay;
    constructor() {
        this.tokenService = new token_service_js_1.TokenService();
    }
    authentication = async (socket, next) => {
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
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    };
    initializeIo = (httpServer) => {
        this.io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: "http://127.0.0.1:5500",
                methods: ["GET", "POST"],
                credentials: true,
            },
        });
        this.io.of("/").use(this.authentication);
        this.io.on("connection", (socket) => {
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
exports.RealtimeGateWay = RealtimeGateWay;
exports.realTimeGateWay = new RealtimeGateWay();
