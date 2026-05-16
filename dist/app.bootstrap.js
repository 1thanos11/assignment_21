"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_2 = require("graphql-http/lib/use/express");
const s3_service_js_1 = require("./common/services/s3.service.js");
const node_stream_1 = require("node:stream");
const node_util_1 = require("node:util");
const success_response_js_1 = require("./common/response/success.response.js");
const index_js_1 = require("./modules/post/index.js");
const error_middleware_js_1 = require("./middleware/error.middleware.js");
const connect_db_js_1 = __importDefault(require("./DB/connect.db.js"));
const redis_service_js_1 = require("./common/services/redis.service.js");
const index_js_2 = require("./modules/index.js");
const config_js_1 = require("./config/config.js");
const schema_gql_js_1 = require("./modules/graphql/schema.gql.js");
const token_service_js_1 = require("./common/services/token.service.js");
const index_js_3 = require("./modules/chat/index.js");
const s3WriteStream = (0, node_util_1.promisify)(node_stream_1.pipeline);
async function bootstrap() {
    await (0, connect_db_js_1.default)();
    await redis_service_js_1.redisService.connect();
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)(), express_1.default.json());
    app.use("/api/auth", index_js_2.authRouter);
    app.use("/api/user", index_js_2.userRouter);
    app.use("/api/post", index_js_1.postRouter);
    app.use("/api/comment", index_js_2.commentRouter);
    app.use("/api/chat", index_js_3.chatRouter);
    app.all("/graphql", (0, express_2.createHandler)({
        schema: schema_gql_js_1.schema,
        context: async (req) => {
            const tokenService = new token_service_js_1.TokenService();
            try {
                let user = null;
                let decode = null;
                const authorization = req.raw.headers.authorization;
                if (authorization?.startsWith("Bearer ")) {
                    const [, token] = authorization.split(" ");
                    const result = await tokenService.decodeToken({
                        token: token,
                    });
                    user = result.user;
                    decode = result.decode;
                }
                return { user, decode };
            }
            catch (error) {
                return {
                    user: null,
                    decode: null,
                };
            }
        },
    }));
    app.get("upload/*path", async (req, res, next) => {
        const { download, fileName } = req.query;
        const { path } = req.params;
        const Key = path.join("/");
        const { Body, ContentType } = await s3_service_js_1.s3Service.getAsset({ Key });
        res.setHeader("Content-Type", ContentType || "application/octet-stream");
        res.set("Cross-Origin-Resource-Policy", "cross-origin");
        if (download === "true") {
            res.setHeader("Content-Disposition", `attachment; filename="${fileName || Key.split("/").pop()}"`);
        }
        return await s3WriteStream(Body, res);
    });
    app.get("uploads/*path", async (req, res, next) => {
        const { download, fileName } = req.query;
        const { path } = req.params;
        const Key = path.join("/");
        const url = await s3_service_js_1.s3Service.createPreSignedUrlFetchLink({
            Key,
            download,
            fileName,
        });
        return (0, success_response_js_1.successResponse)({ res, data: { url } });
    });
    app.get("/*dummy", (req, res, next) => {
        return res.status(404).json({ message: "Invalid application routing" });
    });
    app.use(error_middleware_js_1.GlobalErrorHandler);
    const httpServer = app.listen(config_js_1.PORT, () => {
        console.log(`Server Is Running On PORT ${config_js_1.PORT}`);
    });
    index_js_2.realTimeGateWay.initializeIo(httpServer);
}
exports.default = bootstrap;
