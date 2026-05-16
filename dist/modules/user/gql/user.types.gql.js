"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profile = exports.oneUserType = exports.ProviderGQLEnumType = exports.RoleGQLEnumType = exports.GenderGQLEnumType = void 0;
const graphql_1 = require("graphql");
const user_enums_js_1 = require("../../../common/enums/user.enums.js");
exports.GenderGQLEnumType = new graphql_1.GraphQLEnumType({
    name: "GenderEnum",
    values: {
        MALE: { value: user_enums_js_1.GenderEnum.MALE },
        FEMALE: { value: user_enums_js_1.GenderEnum.FEMALE },
    },
});
exports.RoleGQLEnumType = new graphql_1.GraphQLEnumType({
    name: "RoleEnum",
    values: {
        USER: { value: user_enums_js_1.RoleEnum.USER },
        ADMIN: { value: user_enums_js_1.RoleEnum.ADMIN },
    },
});
exports.ProviderGQLEnumType = new graphql_1.GraphQLEnumType({
    name: "ProviderEnum",
    values: {
        SYSTEM: { value: user_enums_js_1.ProviderEnum.SYSTEM },
        GOOGLE: { value: user_enums_js_1.ProviderEnum.GOOGLE },
    },
});
exports.oneUserType = new graphql_1.GraphQLObjectType({
    name: "userData",
    fields: () => ({
        _id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        firstName: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        lastName: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        username: { type: graphql_1.GraphQLString },
        email: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        password: { type: graphql_1.GraphQLString },
        provider: { type: exports.ProviderGQLEnumType },
        role: { type: exports.RoleGQLEnumType },
        gender: { type: exports.GenderGQLEnumType },
        phone: { type: graphql_1.GraphQLString },
        profilePicture: { type: graphql_1.GraphQLString },
        coverPictures: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
        changeCredentialsTime: { type: graphql_1.GraphQLString },
        confirmEmail: { type: graphql_1.GraphQLString },
        DOB: { type: graphql_1.GraphQLString },
        friends: { type: new graphql_1.GraphQLList(exports.oneUserType) },
        deletedAt: { type: graphql_1.GraphQLString },
        restoredAt: { type: graphql_1.GraphQLString },
        createdAt: { type: graphql_1.GraphQLString },
        updatedAt: { type: graphql_1.GraphQLString },
    }),
});
exports.profile = new graphql_1.GraphQLNonNull(new graphql_1.GraphQLObjectType({
    name: "profile",
    description: "get current user profile",
    fields: {
        data: {
            type: exports.oneUserType,
        },
    },
}));
