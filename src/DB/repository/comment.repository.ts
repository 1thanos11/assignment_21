
import { IComment } from "../../common/interfaces/comment.interface.js";
import { Comment } from "../models/comment.model.js";
import { DataBaseRepository } from "./base.repository.js";

export class CommentRepository extends DataBaseRepository<IComment> {
  constructor() {
    super(Comment);
  }
}
