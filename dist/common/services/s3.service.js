"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Service = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const config_js_1 = require("../../config/config.js");
const node_crypto_1 = require("node:crypto");
const domain_exception_js_1 = require("../exceptions/domain.exception.js");
const multer_enums_js_1 = require("../enums/multer.enums.js");
const node_fs_1 = require("node:fs");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
class S3Service {
    client;
    constructor() {
        this.client = new client_s3_1.S3Client({
            region: config_js_1.AWS_REGION,
            credentials: {
                accessKeyId: config_js_1.AWS_ACCESS_KEY_ID,
                secretAccessKey: config_js_1.AWS_SECRET_ACCESS_KEY,
            },
        });
    }
    async uploadAsset({ storage = multer_enums_js_1.StorageEnum.MEMORY, Bucket = config_js_1.AWS_BUCKET_NAME, file, ACL = client_s3_1.ObjectCannedACL.private, path = "general", ContentType, }) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket,
            Key: `${config_js_1.APPLICATION_NAME}/${path}/${(0, node_crypto_1.randomUUID)()}_${file.originalname}`,
            ACL,
            Body: storage === multer_enums_js_1.StorageEnum.MEMORY
                ? file.buffer
                : (0, node_fs_1.createReadStream)(file.path),
            ContentType: file.mimetype || ContentType,
        });
        if (!command.input.Key) {
            throw new domain_exception_js_1.BadRequestException("Fail to upload this asset");
        }
        await this.client.send(command);
        return command.input?.Key;
    }
    async uploadLargeAsset({ storage = multer_enums_js_1.StorageEnum.MEMORY, Bucket = config_js_1.AWS_BUCKET_NAME, file, ACL = client_s3_1.ObjectCannedACL.private, path = "general", ContentType, partSize = 5, }) {
        const uploadFile = new lib_storage_1.Upload({
            client: this.client,
            params: {
                Bucket,
                Key: `${config_js_1.APPLICATION_NAME}/${path}/${(0, node_crypto_1.randomUUID)()}_${file.originalname}`,
                ACL,
                Body: storage === multer_enums_js_1.StorageEnum.MEMORY
                    ? file.buffer
                    : (0, node_fs_1.createReadStream)(file.path),
                ContentType: file.mimetype || ContentType,
            },
            partSize: partSize * 1024 * 1024,
        });
        return await uploadFile.done();
    }
    async uploadAssets({ uploadType = multer_enums_js_1.UploadEnum.SMALL, storage = multer_enums_js_1.StorageEnum.MEMORY, Bucket = config_js_1.AWS_BUCKET_NAME, files, ACL = client_s3_1.ObjectCannedACL.private, path = "general", ContentType, }) {
        let urls = [];
        if (uploadType === multer_enums_js_1.UploadEnum.LARGE) {
            const data = await Promise.all(files.map((file) => {
                return this.uploadLargeAsset({
                    storage,
                    Bucket,
                    file,
                    ACL,
                    path,
                    ContentType,
                });
            }));
            urls = data.map((ele) => ele.Key);
        }
        else {
            urls = await Promise.all(files.map((file) => {
                return this.uploadAsset({
                    storage,
                    Bucket,
                    file,
                    ACL,
                    path,
                    ContentType,
                });
            }));
        }
        return urls;
    }
    async getAsset({ Bucket = config_js_1.AWS_BUCKET_NAME, Key, }) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket,
            Key,
        });
        return await this.client.send(command);
    }
    async createPreSignedUploadUrl({ Bucket = config_js_1.AWS_BUCKET_NAME, path = "general", Originalname, ContentType, expiresIn = config_js_1.AWS_EXPIRES_IN, }) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket,
            Key: `${config_js_1.APPLICATION_NAME}/${path}/${(0, node_crypto_1.randomUUID)()}_${Originalname}`,
            ContentType,
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.client, command, {
            expiresIn,
        });
        if (!command.input.Key) {
            throw new domain_exception_js_1.BadRequestException("Fail to upload this asset");
        }
        return { url, Key: command.input.Key };
    }
    async createPreSignedUrlFetchLink({ Bucket = config_js_1.AWS_BUCKET_NAME, Key, fileName, download, expiresIn = config_js_1.AWS_EXPIRES_IN, }) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket,
            Key,
            ResponseContentDisposition: download === "true"
                ? `attachment; filename="${fileName || Key.split("/").pop()}"`
                : undefined,
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.client, command, { expiresIn });
        return url;
    }
    async deleteAsset({ Bucket = config_js_1.AWS_BUCKET_NAME, Key, }) {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket,
            Key,
        });
        return await this.client.send(command);
    }
    async deleteAssets({ Bucket = config_js_1.AWS_BUCKET_NAME, Keys, }) {
        const command = new client_s3_1.DeleteObjectsCommand({
            Bucket,
            Delete: {
                Objects: Keys,
                Quiet: false,
            },
        });
        return await this.client.send(command);
    }
    async listFolderDir({ Bucket = config_js_1.AWS_BUCKET_NAME, prefix, }) {
        const command = new client_s3_1.ListObjectsV2Command({
            Bucket,
            Prefix: `${config_js_1.APPLICATION_NAME}/${prefix}`,
        });
        return await this.client.send(command);
    }
}
exports.s3Service = new S3Service();
