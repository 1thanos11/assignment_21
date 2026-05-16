import { Request } from "express";
import { FileFilterCallback } from "multer";
import { BadRequestException } from "../../exceptions/domain.exception.js";

export const fileFilterValidation = {
  image: ["image/png", "image/jpg"],
  video: ["video/mp4"],
};

export const fileFilter = (validation: Array<string>) => {
  return function (
    req: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback,
  ) {
    if (!validation.includes(file.mimetype)) {
      return callback(
        new BadRequestException(
          `invalid file type please upload ${validation} files only`,
        ),
      );
    }

    return callback(null, true);
  };
};
