"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadEnum = exports.StorageEnum = void 0;
var StorageEnum;
(function (StorageEnum) {
    StorageEnum[StorageEnum["MEMORY"] = 0] = "MEMORY";
    StorageEnum[StorageEnum["DISK"] = 1] = "DISK";
})(StorageEnum || (exports.StorageEnum = StorageEnum = {}));
var UploadEnum;
(function (UploadEnum) {
    UploadEnum[UploadEnum["SMALL"] = 0] = "SMALL";
    UploadEnum[UploadEnum["LARGE"] = 1] = "LARGE";
})(UploadEnum || (exports.UploadEnum = UploadEnum = {}));
