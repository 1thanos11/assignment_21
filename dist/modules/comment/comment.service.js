"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentService = void 0;
const mongoose_1 = require("mongoose");
const domain_exception_js_1 = require("../../common/exceptions/domain.exception.js");
const redis_service_js_1 = require("../../common/services/redis.service.js");
const s3_service_js_1 = require("../../common/services/s3.service.js");
const comment_repository_js_1 = require("../../DB/repository/comment.repository.js");
const post_repository_js_1 = require("../../DB/repository/post.repository.js");
const user_repository_js_1 = require("../../DB/repository/user.repository.js");
const notification_service_js_1 = require("../../common/services/notification.service.js");
const post_js_1 = require("../../common/utils/post.js");
class CommentService {
    userRepository;
    postRepository;
    commentRepository;
    s3 = s3_service_js_1.s3Service;
    redis = redis_service_js_1.redisService;
    notification = notification_service_js_1.notificationService;
    constructor() {
        this.userRepository = new user_repository_js_1.UserRepository();
        this.postRepository = new post_repository_js_1.PostRepository();
        this.commentRepository = new comment_repository_js_1.CommentRepository();
    }
    async createComment(inputs) {
        const { user, postId, content, files, tags } = inputs;
        const targetPost = await this.postRepository.findOne({
            filter: { _id: postId, $or: (0, post_js_1.getAvailability)(user) },
        });
        if (!targetPost) {
            throw new domain_exception_js_1.NotFoundException("post not found");
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
        let folderId = targetPost.folderId;
        let attachments = [];
        if (files?.length) {
            attachments = await this.s3.uploadAssets({
                files,
                path: `/Post/${folderId}`,
            });
        }
        const comment = await this.commentRepository.createOne({
            data: {
                createdBy: user._id,
                folderId,
                content,
                attachments,
                postId: targetPost._id,
                tags: mentions,
            },
        });
        if (!comment) {
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
                        message: `${user.username} mentioned you in comment`,
                        post: targetPost._id,
                        comment: comment._id,
                    }),
                },
            });
        }
        return comment.toJSON();
    }
    async replyOnComment(inputs) {
        const { user, commentId, postId, content, files, tags } = inputs;
        const targetComment = await this.commentRepository.findOne({
            filter: { _id: commentId, postId },
            options: {
                populate: [{ path: "postId", match: { $or: (0, post_js_1.getAvailability)(user) } }],
            },
        });
        if (!targetComment?.postId) {
            throw new domain_exception_js_1.NotFoundException("post not found");
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
        const post = targetComment.postId;
        let folderId = post.folderId;
        let attachments = [];
        if (files?.length) {
            attachments = await this.s3.uploadAssets({
                files,
                path: `/Post/${folderId}`,
            });
        }
        const reply = await this.commentRepository.createOne({
            data: {
                createdBy: user._id,
                folderId,
                content,
                attachments,
                postId: post._id,
                commentId: targetComment._id,
                tags: mentions,
            },
        });
        if (!reply) {
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
                        message: `${user.username} mentioned you in comment`,
                        post: post._id,
                        comment: targetComment._id,
                        reply: reply._id,
                    }),
                },
            });
        }
        return reply.toJSON();
    }
}
exports.commentService = new CommentService();
