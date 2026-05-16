"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const graphql_1 = require("graphql");
const user_schema_gql_js_1 = require("../user/gql/user.schema.gql.js");
const post_schema_gql_js_1 = require("../post/gql/post.schema.gql.js");
const query = new graphql_1.GraphQLObjectType({
    name: "query",
    description: "optional text",
    fields: {
        ...user_schema_gql_js_1.userGraphQlSchema.registerQuery(),
        ...post_schema_gql_js_1.postGQLSchema.registerQuery(),
    },
});
const mutation = new graphql_1.GraphQLObjectType({
    name: "mutation",
    description: "optional text",
    fields: {
        ...post_schema_gql_js_1.postGQLSchema.registerMutation(),
    },
});
exports.schema = new graphql_1.GraphQLSchema({ query, mutation });
