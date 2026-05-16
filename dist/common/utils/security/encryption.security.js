"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const config_js_1 = require("../../../config/config.js");
const encrypt = async ({ plaintext, }) => {
    const iv = node_crypto_1.default.randomBytes(config_js_1.IV_LENGTH);
    const cipher = node_crypto_1.default.createCipheriv("aes-256-cbc", config_js_1.ENCRYPTION_SECRET_KEY, iv);
    let cipherText = cipher.update(plaintext, "utf-8", "hex");
    cipherText += cipher.final("hex");
    return `${iv.toString("hex")}:${cipherText}`;
};
exports.encrypt = encrypt;
const decrypt = async ({ encryptedData, }) => {
    const [iv, cipherText] = encryptedData.split(":");
    if (!iv || !cipherText) {
        throw new Error("Invalid encrypted data format");
    }
    const binaryLikeIv = Buffer.from(iv, "hex");
    const decipher = node_crypto_1.default.createDecipheriv("aes-256-cbc", config_js_1.ENCRYPTION_SECRET_KEY, binaryLikeIv);
    let plaintext = decipher.update(cipherText, "hex", "utf-8");
    plaintext += decipher.final("utf-8");
    return plaintext;
};
exports.decrypt = decrypt;
