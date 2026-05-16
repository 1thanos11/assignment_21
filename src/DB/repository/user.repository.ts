import { IUser } from "../../common/interfaces/user.interface.js";
import { User } from "../models/user.model.js";
import { DataBaseRepository } from "./base.repository.js";

export class UserRepository extends DataBaseRepository<IUser> {
  constructor() {
    super(User);
  }
}
