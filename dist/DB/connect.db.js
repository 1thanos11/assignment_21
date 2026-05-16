"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = require("mongoose");
const config_js_1 = require("../config/config.js");
const connectDB = async () => {
    try {
        await (0, mongoose_1.connect)(config_js_1.DB_URI, { serverSelectionTimeoutMS: 30000 });
        console.log(`DataBase Connected Successfully`);
    }
    catch (error) {
        console.log(`DataBase Connection Failed`);
    }
};
exports.connectDB = connectDB;
exports.default = exports.connectDB;
