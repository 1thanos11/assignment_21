"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostRepository = void 0;
const base_repository_js_1 = require("./base.repository.js");
const post_model_js_1 = require("../models/post.model.js");
class PostRepository extends base_repository_js_1.DataBaseRepository {
    constructor() {
        super(post_model_js_1.Post);
    }
}
exports.PostRepository = PostRepository;
