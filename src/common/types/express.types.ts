import { HydratedDocument } from "mongoose";
import { IUser } from "../interfaces/user.interface.js";
import { JwtPayload } from "jsonwebtoken";


declare module "express-serve-static-core" {
  interface Request {
    user: HydratedDocument<IUser>;
    decode: JwtPayload;
  }
}
