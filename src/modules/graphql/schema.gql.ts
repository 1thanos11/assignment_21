import {
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";
import { userGraphQlSchema } from "../user/gql/user.schema.gql.js";
import { postGQLSchema } from "../post/gql/post.schema.gql.js";

const query = new GraphQLObjectType({
  name: "query",
  description: "optional text",
  fields: {
    ...userGraphQlSchema.registerQuery(),
    ...postGQLSchema.registerQuery(),
  },
});

const mutation = new GraphQLObjectType({
  name: "mutation",
  description: "optional text",
  fields: {
    ...postGQLSchema.registerMutation(),
  },
});

//graphQl
export const schema = new GraphQLSchema({ query, mutation });
