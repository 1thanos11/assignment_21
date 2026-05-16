import { Types } from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../enums/user.enums.js";

export interface IUser {
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  password?: string;
  provider: ProviderEnum;
  role: RoleEnum;
  gender: GenderEnum;
  phone?: string | undefined;
  profilePicture?: string;
  coverPictures?: string[];
  changeCredentialsTime?: Date;
  confirmEmail?: Date;
  DOB?: Date;
  friends?: Array<Types.ObjectId>;
  deletedAt?: Date;
  restoredAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
