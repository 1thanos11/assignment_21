import {
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import * as UserGQLTypes from "./user.types.gql.js";
import * as UserGQLArgs from "./user.args.gql.js";
import { UserResolver } from "./user.resolver.js";

class UserGraphQlSchema {
  private userResolver: UserResolver;
  constructor() {
    this.userResolver = new UserResolver();
  }
  //queries
  registerQuery() {
    return {
      profile: {
        description: "method to sum 2 numbers",
        type: UserGQLTypes.profile,
        args: UserGQLArgs.profile,
        resolve: this.userResolver.profile,
      },
    };
  }
}

export const userGraphQlSchema = new UserGraphQlSchema();
