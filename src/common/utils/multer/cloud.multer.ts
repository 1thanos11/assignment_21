import multer from "multer";
import type { Request } from "express";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { StorageEnum } from "../../enums/multer.enums.js";
import { fileFilter } from "./validation.js";

export const cloudFileUpload = ({
  storageDest = StorageEnum.MEMORY,
  validation,
  maxSize = 2,
}: {
  storageDest?: StorageEnum;
  validation: Array<string>;
  maxSize?: number;
}) => {
  const storage =
    storageDest === StorageEnum.MEMORY
      ? multer.memoryStorage()
      : multer.diskStorage({
          destination: function (
            req: Request,
            file: Express.Multer.File,
            callback: (error: Error | null, destination: string) => void,
          ) {
            callback(null, tmpdir());
          },
          filename: function (
            req: Request,
            file: Express.Multer.File,
            callback: (error: Error | null, filename: string) => void,
          ) {
            callback(null, `${randomUUID()}__${file.originalname}`);
          },
        });

  return multer({
    fileFilter: fileFilter(validation),
    storage,
    limits: { fileSize: maxSize * 1024 * 1024 },
  });
};
