import { HydratedDocument } from "mongoose";
import { IUser } from "../interfaces/user.interface.js";
import { AvailabilityEnum } from "../enums/post.enums.js";

export const getAvailability = (user: HydratedDocument<IUser>) => {
  return [
    { availability: AvailabilityEnum.PUBLIC },
    { availability: AvailabilityEnum.ONLY_ME, createdBy: user._id },
    {
      availability: AvailabilityEnum.FRIENDS,
      createdBy: { $in: [user._id, ...(user.friends || [])] },
    },
    { tags: { $in: [user._id] } },
  ];
};
