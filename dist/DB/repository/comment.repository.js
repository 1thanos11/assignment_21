"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentRepository = void 0;
const comment_model_js_1 = require("../models/comment.model.js");
const base_repository_js_1 = require("./base.repository.js");
class CommentRepository extends base_repository_js_1.DataBaseRepository {
    constructor() {
        super(comment_model_js_1.Comment);
    }
}
exports.CommentRepository = CommentRepository;
