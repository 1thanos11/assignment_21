"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = void 0;
const generateOtp = async () => {
    return Math.floor(Math.random() * 900000 + 100000);
};
exports.generateOtp = generateOtp;
