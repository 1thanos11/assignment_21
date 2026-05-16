"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityService = void 0;
const encryption_security_js_1 = require("../utils/security/encryption.security.js");
const hash_security_js_1 = require("../utils/security/hash.security.js");
class SecurityService {
    constructor() { }
    generateHash = hash_security_js_1.generateHash;
    compareHash = hash_security_js_1.compareHash;
    encrypt = encryption_security_js_1.encrypt;
    decrypt = encryption_security_js_1.decrypt;
}
exports.SecurityService = SecurityService;
