"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileFilter = exports.fileFilterValidation = void 0;
const domain_exception_js_1 = require("../../exceptions/domain.exception.js");
exports.fileFilterValidation = {
    image: ["image/png", "image/jpg"],
    video: ["video/mp4"],
};
const fileFilter = (validation) => {
    return function (req, file, callback) {
        if (!validation.includes(file.mimetype)) {
            return callback(new domain_exception_js_1.BadRequestException(`invalid file type please upload ${validation} files only`));
        }
        return callback(null, true);
    };
};
exports.fileFilter = fileFilter;
