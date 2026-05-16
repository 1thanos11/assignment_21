import type { NextFunction, Request, Response } from "express";
import { NODE_ENV } from "../config/config.js";

interface IError extends Error {
  statusCode: number;
}

export const GlobalErrorHandler = (
  error: IError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (error.name === "MulterError") {
    error.statusCode = 400;
  }
  res.status(error.statusCode || 500).json({
    success: false,
    status: error.statusCode,
    msg: error.message || "internal server error",
    stack: NODE_ENV === "dev" ? error.stack : undefined,
    cause: error.cause,
    error: NODE_ENV === "dev" ? error : undefined,
  });
};
