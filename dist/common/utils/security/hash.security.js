"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareHash = exports.generateHash = void 0;
const bcrypt_1 = require("bcrypt");
const config_js_1 = require("../../../config/config.js");
const generateHash = async ({ data, rounds = config_js_1.SALT_ROUND, }) => {
    const salt = await (0, bcrypt_1.genSalt)(rounds);
    return await (0, bcrypt_1.hash)(data, salt);
};
exports.generateHash = generateHash;
const compareHash = async ({ plaintext, encrypted, }) => {
    return await (0, bcrypt_1.compare)(plaintext, encrypted);
};
exports.compareHash = compareHash;
