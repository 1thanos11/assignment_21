"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailability = void 0;
const post_enums_js_1 = require("../enums/post.enums.js");
const getAvailability = (user) => {
    return [
        { availability: post_enums_js_1.AvailabilityEnum.PUBLIC },
        { availability: post_enums_js_1.AvailabilityEnum.ONLY_ME, createdBy: user._id },
        {
            availability: post_enums_js_1.AvailabilityEnum.FRIENDS,
            createdBy: { $in: [user._id, ...(user.friends || [])] },
        },
        { tags: { $in: [user._id] } },
    ];
};
exports.getAvailability = getAvailability;
