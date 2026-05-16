import {
  GraphQLEnumType,
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLString,
} from "graphql";
import { ReactTypeEnum } from "../../../common/utils/email/react.enums.js";

export const postsList = {
  page: { type: GraphQLInt },
  size: { type: GraphQLInt },
  search: { type: GraphQLString },
};

//react post enum
export const GQLReactPostEnum = new GraphQLEnumType({
  name: "GQLReactEnum",
  values: {
    HAHA: { value: ReactTypeEnum.HAHA },
    SAD: { value: ReactTypeEnum.SAD },
    LIKE: { value: ReactTypeEnum.LIKE },
    LOVE: { value: ReactTypeEnum.LOVE },
    CARE: { value: ReactTypeEnum.CARE },
    ANGRY: { value: ReactTypeEnum.ANGRY },
  },
});
export const reactPost = {
  react: { type: GQLReactPostEnum },
  postId: { type: new GraphQLNonNull(GraphQLID) },
};
