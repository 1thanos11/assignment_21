import {
  CompleteMultipartUploadCommandOutput,
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  DeleteObjectsCommand,
  DeleteObjectsCommandOutput,
  GetObjectCommand,
  GetObjectCommandOutput,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  APPLICATION_NAME,
  AWS_ACCESS_KEY_ID,
  AWS_BUCKET_NAME,
  AWS_EXPIRES_IN,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
} from "../../config/config.js";
import { randomUUID } from "node:crypto";
import { BadRequestException } from "../exceptions/domain.exception.js";
import { StorageEnum, UploadEnum } from "../enums/multer.enums.js";
import { createReadStream } from "node:fs";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

class S3Service {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  //upload asset
  async uploadAsset({
    storage = StorageEnum.MEMORY,
    Bucket = AWS_BUCKET_NAME,
    file,
    ACL = ObjectCannedACL.private,
    path = "general",
    ContentType,
  }: {
    storage?: StorageEnum;
    Bucket?: string;
    file: Express.Multer.File;
    ACL?: ObjectCannedACL;
    path?: string;
    ContentType?: string | undefined;
  }): Promise<string> {
    const command = new PutObjectCommand({
      Bucket,
      Key: `${APPLICATION_NAME}/${path}/${randomUUID()}_${file.originalname}`,
      ACL,
      Body:
        storage === StorageEnum.MEMORY
          ? file.buffer
          : createReadStream(file.path),
      ContentType: file.mimetype || ContentType,
    });
    if (!command.input.Key) {
      throw new BadRequestException("Fail to upload this asset");
    }
    await this.client.send(command);

    return command.input?.Key;
  }

  //upload assets
  async uploadLargeAsset({
    storage = StorageEnum.MEMORY,
    Bucket = AWS_BUCKET_NAME,
    file,
    ACL = ObjectCannedACL.private,
    path = "general",
    ContentType,
    partSize = 5,
  }: {
    storage?: StorageEnum;
    Bucket?: string;
    file: Express.Multer.File;
    ACL: ObjectCannedACL;
    path?: string;
    ContentType?: string | undefined;
    partSize?: number;
  }): Promise<CompleteMultipartUploadCommandOutput> {
    const uploadFile = new Upload({
      client: this.client,
      params: {
        Bucket,
        Key: `${APPLICATION_NAME}/${path}/${randomUUID()}_${file.originalname}`,
        ACL,
        Body:
          storage === StorageEnum.MEMORY
            ? file.buffer
            : createReadStream(file.path),
        ContentType: file.mimetype || ContentType,
      },
      partSize: partSize * 1024 * 1024,
    });

    return await uploadFile.done();
  }

  //upload assets
  async uploadAssets({
    uploadType = UploadEnum.SMALL,
    storage = StorageEnum.MEMORY,
    Bucket = AWS_BUCKET_NAME,
    files,
    ACL = ObjectCannedACL.private,
    path = "general",
    ContentType,
  }: {
    uploadType?: UploadEnum;
    storage?: StorageEnum;
    Bucket?: string;
    files: Array<Express.Multer.File>;
    ACL?: ObjectCannedACL;
    path?: string;
    ContentType?: string;
  }): Promise<Array<string>> {
    let urls: Array<string> = [];
    if (uploadType === UploadEnum.LARGE) {
      const data = await Promise.all(
        files.map((file) => {
          return this.uploadLargeAsset({
            storage,
            Bucket,
            file,
            ACL,
            path,
            ContentType,
          });
        }),
      );

      urls = data.map((ele) => ele.Key as string);
    } else {
      urls = await Promise.all(
        files.map((file) => {
          return this.uploadAsset({
            storage,
            Bucket,
            file,
            ACL,
            path,
            ContentType,
          });
        }),
      );
    }

    return urls;
  }

  //get asset
  async getAsset({
    Bucket = AWS_BUCKET_NAME,
    Key,
  }: {
    Bucket?: string;
    Key: string;
  }): Promise<GetObjectCommandOutput> {
    const command = new GetObjectCommand({
      Bucket,
      Key,
    });

    return await this.client.send(command);
  }

  //create presigned url
  async createPreSignedUploadUrl({
    Bucket = AWS_BUCKET_NAME,
    path = "general",
    Originalname,
    ContentType,
    expiresIn = AWS_EXPIRES_IN,
  }: {
    Bucket?: string;
    path?: string;
    ContentType: string;
    Originalname: string;
    expiresIn?: number;
  }): Promise<{ url: string; Key: string }> {
    const command = new PutObjectCommand({
      Bucket,
      Key: `${APPLICATION_NAME}/${path}/${randomUUID()}_${Originalname}`,
      ContentType,
    });
    const url = await getSignedUrl(this.client, command, {
      expiresIn,
    });
    if (!command.input.Key) {
      throw new BadRequestException("Fail to upload this asset");
    }

    return { url, Key: command.input.Key as string };
  }

  //create presigned url fetch link
  async createPreSignedUrlFetchLink({
    Bucket = AWS_BUCKET_NAME,
    Key,
    fileName,
    download,
    expiresIn = AWS_EXPIRES_IN,
  }: {
    Bucket?: string;
    Key: string;
    fileName?: string;
    download?: string;
    expiresIn?: number;
  }): Promise<string> {
    const command = new GetObjectCommand({
      Bucket,
      Key,
      ResponseContentDisposition:
        download === "true"
          ? `attachment; filename="${fileName || Key.split("/").pop()}"`
          : undefined,
    });
    const url = await getSignedUrl(this.client, command, { expiresIn });

    return url;
  }

  //delete asset
  async deleteAsset({
    Bucket = AWS_BUCKET_NAME,
    Key,
  }: {
    Bucket?: string;
    Key: string;
  }): Promise<DeleteObjectCommandOutput> {
    const command = new DeleteObjectCommand({
      Bucket,
      Key,
    });

    return await this.client.send(command);
  }

  //delete assets
  async deleteAssets({
    Bucket = AWS_BUCKET_NAME,
    Keys,
  }: {
    Bucket?: string;
    Keys: Array<{ Key: string }>;
  }): Promise<DeleteObjectsCommandOutput> {
    const command = new DeleteObjectsCommand({
      Bucket,
      Delete: {
        Objects: Keys,
        Quiet: false,
      },
    });

    return await this.client.send(command);
  }

  //list folder dir
  async listFolderDir({
    Bucket = AWS_BUCKET_NAME,
    prefix,
  }: {
    Bucket?: string;
    prefix: string;
  }): Promise<ListObjectsV2CommandOutput> {
    const command = new ListObjectsV2Command({
      Bucket,
      Prefix: `${APPLICATION_NAME}/${prefix}`,
    });

    return await this.client.send(command);
  }
}

export const s3Service = new S3Service();
