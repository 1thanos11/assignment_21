import { HydratedDocument } from "mongoose";
import { DataBaseRepository } from "./base.repository.js";
import { IPost } from "../../common/interfaces/post.interface.js";
import { Post } from "../models/post.model.js";


export class PostRepository extends DataBaseRepository<HydratedDocument<IPost>> {
  constructor() {
    super(Post);
  }
}
