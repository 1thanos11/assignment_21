"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const user_service_js_1 = require("../user.service.js");
class UserResolver {
    userService;
    constructor() {
        this.userService = user_service_js_1.userService;
    }
    profile = async (parent, args, { user }) => {
        const data = user_service_js_1.userService.profile({ user });
        return { data };
    };
}
exports.UserResolver = UserResolver;
