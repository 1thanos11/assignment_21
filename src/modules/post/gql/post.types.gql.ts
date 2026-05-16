import {
  GraphQLEnumType,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { ReactTypeEnum } from "../../../common/utils/email/react.enums.js";
import { AvailabilityEnum } from "../../../common/enums/post.enums.js";
import {
  GenderGQLEnumType,
  oneUserType,
  ProviderGQLEnumType,
  RoleGQLEnumType,
} from "../../user/gql/user.types.gql.js";

//enums
export const ReactGQLEnum = new GraphQLEnumType({
  name: "ReactGQLEnum",
  values: {
    HAHA: { value: ReactTypeEnum.HAHA },
    SAD: { value: ReactTypeEnum.SAD },
    LIKE: { value: ReactTypeEnum.LIKE },
    LOVE: { value: ReactTypeEnum.LOVE },
    CARE: { value: ReactTypeEnum.CARE },
    ANGRY: { value: ReactTypeEnum.ANGRY },
  },
});
export const AvailabilityGQLEnum = new GraphQLEnumType({
  name: "AvailabilityGQLEnum",
  values: {
    PUBLIC: { value: AvailabilityEnum.PUBLIC },
    ONLY_ME: { value: AvailabilityEnum.ONLY_ME },
    FRIENDS: { value: AvailabilityEnum.FRIENDS },
  },
});
export const userType = new GraphQLObjectType({
  name: "userType",
  fields: {
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
  },
});
export const likeType = new GraphQLObjectType({
  name: "likeType",
  fields: {
    // userId: { type: GraphQLID },
    userId: { type: userType },
    reactType: { type: ReactGQLEnum },
  },
});

//one post type
export const onePostType: GraphQLObjectType = new GraphQLObjectType({
  name: "onePostType",
  fields: () => ({
    _id: { type: new GraphQLNonNull(GraphQLID) },
    folderId: { type: GraphQLString },
    content: { type: GraphQLString },
    attachments: { type: new GraphQLList(GraphQLString) },
    likes: { type: new GraphQLList(likeType) },
    tags: { type: new GraphQLList(onePostType) },
    availability: { type: AvailabilityGQLEnum },
    createdBy: { type: onePostType },
    updatedBy: { type: onePostType },
    exceptedFor: { type: new GraphQLList(onePostType) },
    deletedAt: { type: GraphQLString },
    restoredAt: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  }),
});
//post list type
export const postsList = new GraphQLObjectType({
  name: "postsListResponse",
  fields: {
    message: { type: GraphQLString },
    data: {
      type: new GraphQLObjectType({
        name: "paginatedData",
        fields: {
          docs: { type: new GraphQLList(onePostType) },
          currentPage: { type: GraphQLInt },
          size: { type: GraphQLInt },
          pages: { type: GraphQLInt },
        },
      }),
    },
  },
});

//react post
export const reactPost = new GraphQLObjectType({
  name: "reactOnPost",
  fields: {
    message: { type: GraphQLString },
    data: { type: onePostType },
  },
});
