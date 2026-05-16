import { HydratedDocument } from "mongoose";
import { PostService } from "../post.service.js";
import { IUser } from "../../../common/interfaces/user.interface.js";
import { TokenService } from "../../../common/services/token.service.js";
import { IAuthDto } from "../../user/user.dto.js";
import { GQLValidate } from "../../../middleware/validation.middleware.js";
import {
  PaginateDto,
  paginateSchema,
} from "../../../common/validation/general.validation.js";
import { ReactPostDto, ReactPostArgsDto } from "../post.dto.js";
import { reactPostSchema, reactPostSchemaGQL } from "../post.validation.js";

export class PostResolver {
  private readonly postService: PostService;
  private readonly tokenService: TokenService;
  constructor() {
    this.postService = new PostService();
    this.tokenService = new TokenService();
  }

  //posts list
  postsListResolver = async (
    parent: unknown,
    args: PaginateDto,
    { user }: IAuthDto,
  ) => {
    await GQLValidate<PaginateDto>(paginateSchema.query, args);
    const data = await this.postService.postsList({ ...args, user });
    return { message: "Done", data };
  };

  //react post
  reactPost = async (
    parent: any,
    { postId, react }: ReactPostArgsDto,
    { user }: IAuthDto,
  ) => {
    //validation
    await GQLValidate<ReactPostArgsDto>(reactPostSchemaGQL, { postId, react });
    const data = await this.postService.reactPost({ user, postId, react });

    return { message: "Done", data };
  };
}

export const postResolver = new PostResolver();
