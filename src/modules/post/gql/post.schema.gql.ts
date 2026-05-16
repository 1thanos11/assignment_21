import * as PostGQLTypes from "./post.types.gql.js";
import * as PostGQLArgs from "./post.args.gql.js";
import { PostResolver, postResolver } from "./post.resolver.js";

export class PostGQLSchema {
  private readonly postResolver: PostResolver = postResolver;
  constructor() {}

  //query
  registerQuery() {
    return {
      postList: {
        type: PostGQLTypes.postsList,
        args: PostGQLArgs.postsList,
        resolve: this.postResolver.postsListResolver,
      },
    };
  }

  //mutation
  registerMutation() {
    return {
      reactPost: {
        type: PostGQLTypes.reactPost,
        args: PostGQLArgs.reactPost,
        resolve: this.postResolver.reactPost,
      },
    };
  }
}

export const postGQLSchema = new PostGQLSchema();
