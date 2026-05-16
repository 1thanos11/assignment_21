"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactPost = exports.GQLReactPostEnum = exports.postsList = void 0;
const graphql_1 = require("graphql");
const react_enums_js_1 = require("../../../common/utils/email/react.enums.js");
exports.postsList = {
    page: { type: graphql_1.GraphQLInt },
    size: { type: graphql_1.GraphQLInt },
    search: { type: graphql_1.GraphQLString },
};
exports.GQLReactPostEnum = new graphql_1.GraphQLEnumType({
    name: "GQLReactEnum",
    values: {
        HAHA: { value: react_enums_js_1.ReactTypeEnum.HAHA },
        SAD: { value: react_enums_js_1.ReactTypeEnum.SAD },
        LIKE: { value: react_enums_js_1.ReactTypeEnum.LIKE },
        LOVE: { value: react_enums_js_1.ReactTypeEnum.LOVE },
        CARE: { value: react_enums_js_1.ReactTypeEnum.CARE },
        ANGRY: { value: react_enums_js_1.ReactTypeEnum.ANGRY },
    },
});
exports.reactPost = {
    react: { type: exports.GQLReactPostEnum },
    postId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
};
