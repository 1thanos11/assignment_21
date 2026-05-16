"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postResolver = exports.PostResolver = void 0;
const post_service_js_1 = require("../post.service.js");
const token_service_js_1 = require("../../../common/services/token.service.js");
const validation_middleware_js_1 = require("../../../middleware/validation.middleware.js");
const general_validation_js_1 = require("../../../common/validation/general.validation.js");
const post_validation_js_1 = require("../post.validation.js");
class PostResolver {
    postService;
    tokenService;
    constructor() {
        this.postService = new post_service_js_1.PostService();
        this.tokenService = new token_service_js_1.TokenService();
    }
    postsListResolver = async (parent, args, { user }) => {
        await (0, validation_middleware_js_1.GQLValidate)(general_validation_js_1.paginateSchema.query, args);
        const data = await this.postService.postsList({ ...args, user });
        return { message: "Done", data };
    };
    reactPost = async (parent, { postId, react }, { user }) => {
        await (0, validation_middleware_js_1.GQLValidate)(post_validation_js_1.reactPostSchemaGQL, { postId, react });
        const data = await this.postService.reactPost({ user, postId, react });
        return { message: "Done", data };
    };
}
exports.PostResolver = PostResolver;
exports.postResolver = new PostResolver();
