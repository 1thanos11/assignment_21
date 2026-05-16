import {
  GraphQLEnumType,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
} from "../../../common/enums/user.enums.js";

//enums
export const GenderGQLEnumType = new GraphQLEnumType({
  name: "GenderEnum",
  values: {
    MALE: { value: GenderEnum.MALE },
    FEMALE: { value: GenderEnum.FEMALE },
  },
});
export const RoleGQLEnumType = new GraphQLEnumType({
  name: "RoleEnum",
  values: {
    USER: { value: RoleEnum.USER },
    ADMIN: { value: RoleEnum.ADMIN },
  },
});
export const ProviderGQLEnumType = new GraphQLEnumType({
  name: "ProviderEnum",
  values: {
    SYSTEM: { value: ProviderEnum.SYSTEM },
    GOOGLE: { value: ProviderEnum.GOOGLE },
  },
});

export const oneUserType: GraphQLObjectType = new GraphQLObjectType({
  name: "userData",
  fields: () => ({
    _id: { type: new GraphQLNonNull(GraphQLID) },
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    username: { type: GraphQLString },
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: GraphQLString },
    provider: { type: ProviderGQLEnumType },
    role: { type: RoleGQLEnumType },
    gender: { type: GenderGQLEnumType },
    phone: { type: GraphQLString },
    profilePicture: { type: GraphQLString },
    coverPictures: { type: new GraphQLList(GraphQLString) },
    changeCredentialsTime: { type: GraphQLString },
    confirmEmail: { type: GraphQLString },
    DOB: { type: GraphQLString },
    friends: { type: new GraphQLList(oneUserType) },
    deletedAt: { type: GraphQLString },
    restoredAt: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  }),
});

export const profile = new GraphQLNonNull(
  new GraphQLObjectType({
    name: "profile",
    description: "get current user profile",
    fields: {
      data: {
        type: oneUserType,
      },
    },
  }),
);
