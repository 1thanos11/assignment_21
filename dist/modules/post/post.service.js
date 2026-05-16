"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const node_crypto_1 = require("node:crypto");
const domain_exception_js_1 = require("../../common/exceptions/domain.exception.js");
const notification_service_js_1 = require("../../common/services/notification.service.js");
const redis_service_js_1 = require("../../common/services/redis.service.js");
const s3_service_js_1 = require("../../common/services/s3.service.js");
const post_repository_js_1 = require("../../DB/repository/post.repository.js");
const user_repository_js_1 = require("../../DB/repository/user.repository.js");
const mongoose_1 = require("mongoose");
const post_js_1 = require("../../common/utils/post.js");
class PostService {
    userRepository;
    postRepository;
    redis;
    s3;
    notification;
    constructor(userRepository = new user_repository_js_1.UserRepository(), postRepository = new post_repository_js_1.PostRepository(), redis = redis_service_js_1.redisService, s3 = s3_service_js_1.s3Service, notification = notification_service_js_1.notificationService) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.redis = redis;
        this.s3 = s3;
        this.notification = notification;
    }
    async createPost(inputs) {
        const { user, content, availability, files, tags } = inputs;
        let FCM_TOKENs = [];
        let mentions = [];
        if (tags && tags.length > 0) {
            const tagsSet = [...new Set(tags)];
            const matchedTags = await this.userRepository.find({
                filter: { _id: { $in: tagsSet } },
            });
            if (matchedTags?.length != tagsSet.length) {
                throw new domain_exception_js_1.NotFoundException("Fail to find mention accounts");
            }
            for (const tag of tagsSet) {
                mentions.push(mongoose_1.Types.ObjectId.createFromHexString(tag));
                (await this.redis.getFCMs({ userId: tag })).map((ele) => {
                    FCM_TOKENs.push(ele);
                });
            }
        }
        let folderId = (0, node_crypto_1.randomUUID)();
        let attachments = [];
        if (files?.length) {
            attachments = await this.s3.uploadAssets({
                files,
                path: `/Post/${folderId}`,
            });
        }
        const post = await this.postRepository.createOne({
            data: {
                createdBy: user._id,
                folderId,
                content,
                availability,
                attachments,
                tags: mentions,
            },
        });
        if (!post) {
            if (attachments.length) {
                await this.s3.deleteAssets({
                    Keys: attachments.map((ele) => {
                        return { Key: ele };
                    }),
                });
            }
            throw new domain_exception_js_1.BadRequestException("Can't upload this post");
        }
        if (FCM_TOKENs.length) {
            await this.notification.sendMultiNotification({
                tokens: FCM_TOKENs,
                data: {
                    title: "new post",
                    body: JSON.stringify({
                        message: `${user.username} upload new post`,
                        post: post._id,
                    }),
                },
            });
        }
        return post.toJSON();
    }
    async postsList(inputs) {
        const { user, page, size, search } = inputs;
        const posts = await this.postRepository.paginate({
            filter: {
                $or: (0, post_js_1.getAvailability)(user),
                ...(search ? { content: { $regex: search, $options: "i" } } : {}),
                exceptedFor: { $nin: [user._id] },
            },
            page,
            size,
            options: {
                populate: [
                    {
                        path: "comments",
                        populate: [{ path: "reply", populate: [{ path: "reply" }] }],
                    },
                ],
            },
        });
        return posts;
    }
    async reactPost(inputs) {
        const { user, postId, react } = inputs;
        const post = await this.postRepository.findOneAndUpdate({
            filter: { _id: postId, $or: (0, post_js_1.getAvailability)(user) },
            update: {
                ...(Number(react) >= 0
                    ? { $addToSet: { likes: { userId: user._id, reactType: react } } }
                    : { $pull: { likes: { userId: user._id, reactType: react } } }),
            },
            options: {
                populate: [
                    {
                        path: "likes.userId",
                        select: "firstName lastName",
                    },
                ],
            },
        });
        if (!post) {
            throw new domain_exception_js_1.NotFoundException("post not found");
        }
        return post.toJSON();
    }
    async updatePost(inputs) {
        const { user, postId, content, files, removeFiles, removeTags, tags, availability, } = inputs;
        const post = await this.postRepository.findOne({
            filter: { _id: postId, createdBy: user._id },
        });
        if (!post) {
            throw new domain_exception_js_1.NotFoundException("post not found");
        }
        if (!content &&
            !post.content &&
            !files?.length &&
            post.attachments?.length == removeFiles?.length) {
            throw new domain_exception_js_1.BadRequestException("we can't leave empty post");
        }
        let FCM_TOKENs = [];
        let mentions = [];
        if (tags && tags.length > 0) {
            const tagsSet = [...new Set(tags)];
            const matchedTags = await this.userRepository.find({
                filter: { _id: { $in: tagsSet } },
            });
            if (matchedTags?.length != tagsSet.length) {
                throw new domain_exception_js_1.NotFoundException("Fail to find mention accounts");
            }
            for (const tag of tagsSet) {
                mentions.push(mongoose_1.Types.ObjectId.createFromHexString(tag));
                (await this.redis.getFCMs({ userId: tag })).map((ele) => {
                    FCM_TOKENs.push(ele);
                });
            }
        }
        let folderId = post.folderId;
        let attachments = [];
        if (files?.length) {
            attachments = await this.s3.uploadAssets({
                files,
                path: `/Post/${folderId}`,
            });
        }
        const updatePost = await this.postRepository.findOneAndUpdate({
            filter: {
                _id: mongoose_1.Types.ObjectId.createFromHexString(postId),
                createdBy: user._id,
            },
            update: {
                $set: {
                    updatedBy: user._id,
                    content: content || post.content,
                    availability: Number(availability) || post.availability,
                    attachments: {
                        $setUnion: [
                            { $setDifference: ["$attachments", removeFiles] },
                            attachments,
                        ],
                    },
                    tags: {
                        $setUnion: [
                            {
                                $setDifference: [
                                    "$tags",
                                    removeTags?.map((ele) => {
                                        return mongoose_1.Types.ObjectId.createFromHexString(ele);
                                    }),
                                ],
                            },
                            mentions,
                        ],
                    },
                },
            },
        });
        if (!updatePost) {
            if (attachments.length) {
                await this.s3.deleteAssets({
                    Keys: attachments.map((ele) => {
                        return { Key: ele };
                    }),
                });
            }
            if (removeFiles?.length) {
                await this.s3.deleteAssets({
                    Keys: removeFiles.map((ele) => {
                        return { Key: ele };
                    }),
                });
            }
            throw new domain_exception_js_1.BadRequestException("Can't upload this post");
        }
        if (FCM_TOKENs.length) {
            await this.notification.sendMultiNotification({
                tokens: FCM_TOKENs,
                data: {
                    title: "new post",
                    body: JSON.stringify({
                        message: `${user.username} upload new post`,
                        post: post._id,
                    }),
                },
            });
        }
        return updatePost.toJSON();
    }
}
exports.PostService = PostService;
