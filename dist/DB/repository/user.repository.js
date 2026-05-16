"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const user_model_js_1 = require("../models/user.model.js");
const base_repository_js_1 = require("./base.repository.js");
class UserRepository extends base_repository_js_1.DataBaseRepository {
    constructor() {
        super(user_model_js_1.User);
    }
}
exports.UserRepository = UserRepository;
