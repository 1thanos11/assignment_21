"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactPost = exports.postsList = exports.onePostType = exports.likeType = exports.userType = exports.AvailabilityGQLEnum = exports.ReactGQLEnum = void 0;
const graphql_1 = require("graphql");
const react_enums_js_1 = require("../../../common/utils/email/react.enums.js");
const post_enums_js_1 = require("../../../common/enums/post.enums.js");
const user_types_gql_js_1 = require("../../user/gql/user.types.gql.js");
exports.ReactGQLEnum = new graphql_1.GraphQLEnumType({
    name: "ReactGQLEnum",
    values: {
        HAHA: { value: react_enums_js_1.ReactTypeEnum.HAHA },
        SAD: { value: react_enums_js_1.ReactTypeEnum.SAD },
        LIKE: { value: react_enums_js_1.ReactTypeEnum.LIKE },
        LOVE: { value: react_enums_js_1.ReactTypeEnum.LOVE },
        CARE: { value: react_enums_js_1.ReactTypeEnum.CARE },
        ANGRY: { value: react_enums_js_1.ReactTypeEnum.ANGRY },
    },
});
exports.AvailabilityGQLEnum = new graphql_1.GraphQLEnumType({
    name: "AvailabilityGQLEnum",
    values: {
        PUBLIC: { value: post_enums_js_1.AvailabilityEnum.PUBLIC },
        ONLY_ME: { value: post_enums_js_1.AvailabilityEnum.ONLY_ME },
        FRIENDS: { value: post_enums_js_1.AvailabilityEnum.FRIENDS },
    },
});
exports.userType = new graphql_1.GraphQLObjectType({
    name: "userType",
    fields: {
        _id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        firstName: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        lastName: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        username: { type: graphql_1.GraphQLString },
        email: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        password: { type: graphql_1.GraphQLString },
        provider: { type: user_types_gql_js_1.ProviderGQLEnumType },
        role: { type: user_types_gql_js_1.RoleGQLEnumType },
        gender: { type: user_types_gql_js_1.GenderGQLEnumType },
        phone: { type: graphql_1.GraphQLString },
        profilePicture: { type: graphql_1.GraphQLString },
        coverPictures: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
        changeCredentialsTime: { type: graphql_1.GraphQLString },
        confirmEmail: { type: graphql_1.GraphQLString },
        DOB: { type: graphql_1.GraphQLString },
        friends: { type: new graphql_1.GraphQLList(user_types_gql_js_1.oneUserType) },
        deletedAt: { type: graphql_1.GraphQLString },
        restoredAt: { type: graphql_1.GraphQLString },
        createdAt: { type: graphql_1.GraphQLString },
        updatedAt: { type: graphql_1.GraphQLString },
    },
});
exports.likeType = new graphql_1.GraphQLObjectType({
    name: "likeType",
    fields: {
        userId: { type: exports.userType },
        reactType: { type: exports.ReactGQLEnum },
    },
});
exports.onePostType = new graphql_1.GraphQLObjectType({
    name: "onePostType",
    fields: () => ({
        _id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        folderId: { type: graphql_1.GraphQLString },
        content: { type: graphql_1.GraphQLString },
        attachments: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
        likes: { type: new graphql_1.GraphQLList(exports.likeType) },
        tags: { type: new graphql_1.GraphQLList(exports.onePostType) },
        availability: { type: exports.AvailabilityGQLEnum },
        createdBy: { type: exports.onePostType },
        updatedBy: { type: exports.onePostType },
        exceptedFor: { type: new graphql_1.GraphQLList(exports.onePostType) },
        deletedAt: { type: graphql_1.GraphQLString },
        restoredAt: { type: graphql_1.GraphQLString },
        createdAt: { type: graphql_1.GraphQLString },
        updatedAt: { type: graphql_1.GraphQLString },
    }),
});
exports.postsList = new graphql_1.GraphQLObjectType({
    name: "postsListResponse",
    fields: {
        message: { type: graphql_1.GraphQLString },
        data: {
            type: new graphql_1.GraphQLObjectType({
                name: "paginatedData",
                fields: {
                    docs: { type: new graphql_1.GraphQLList(exports.onePostType) },
                    currentPage: { type: graphql_1.GraphQLInt },
                    size: { type: graphql_1.GraphQLInt },
                    pages: { type: graphql_1.GraphQLInt },
                },
            }),
        },
    },
});
exports.reactPost = new graphql_1.GraphQLObjectType({
    name: "reactOnPost",
    fields: {
        message: { type: graphql_1.GraphQLString },
        data: { type: exports.onePostType },
    },
});
