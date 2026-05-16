import { HydratedDocument, Types } from "mongoose";
import {
  BadRequestException,
  NotFoundException,
} from "../../common/exceptions/domain.exception.js";
import { redisService } from "../../common/services/redis.service.js";
import { s3Service } from "../../common/services/s3.service.js";
import { CommentRepository } from "../../DB/repository/comment.repository.js";
import { PostRepository } from "../../DB/repository/post.repository.js";
import { UserRepository } from "../../DB/repository/user.repository.js";
import { notificationService } from "../../common/services/notification.service.js";
import { CreateCommentDto, ReplyDto } from "./comment.dto.js";
import { getAvailability } from "../../common/utils/post.js";
import { IPost } from "../../common/interfaces/post.interface.js";

class CommentService {
  private readonly userRepository: UserRepository;
  private readonly postRepository: PostRepository;
  private readonly commentRepository: CommentRepository;
  private readonly s3 = s3Service;
  private readonly redis = redisService;
  private readonly notification = notificationService;

  constructor() {
    this.userRepository = new UserRepository();
    this.postRepository = new PostRepository();
    this.commentRepository = new CommentRepository();
  }

  //create comment
  async createComment(inputs: CreateCommentDto) {
    const { user, postId, content, files, tags } = inputs;
    const targetPost = await this.postRepository.findOne({
      filter: { _id: postId, $or: getAvailability(user) },
    });
    if (!targetPost) {
      throw new NotFoundException("post not found");
    }
    let FCM_TOKENs: Array<string> = [];
    let mentions = [];
    if (tags && tags.length > 0) {
      const tagsSet = [...new Set(tags)];
      const matchedTags = await this.userRepository.find({
        filter: { _id: { $in: tagsSet } },
      });
      if (matchedTags?.length != tagsSet.length) {
        throw new NotFoundException("Fail to find mention accounts");
      }
      for (const tag of tagsSet) {
        mentions.push(Types.ObjectId.createFromHexString(tag));
        (await this.redis.getFCMs({ userId: tag })).map((ele) => {
          FCM_TOKENs.push(ele);
        });
      }
    }
    let folderId = targetPost.folderId;
    let attachments: Array<string> = [];
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
      } as any,
    });
    if (!comment) {
      if (attachments.length) {
        await this.s3.deleteAssets({
          Keys: attachments.map((ele) => {
            return { Key: ele };
          }),
        });
      }

      throw new BadRequestException("Can't upload this post");
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

  //reply
  async replyOnComment(inputs: ReplyDto) {
    const { user, commentId, postId, content, files, tags } = inputs;
    const targetComment = await this.commentRepository.findOne({
      filter: { _id: commentId, postId },
      options: {
        populate: [{ path: "postId", match: { $or: getAvailability(user) } }],
      },
    });
    if (!targetComment?.postId) {
      throw new NotFoundException("post not found");
    }
    let FCM_TOKENs: Array<string> = [];
    let mentions = [];
    if (tags && tags.length > 0) {
      const tagsSet = [...new Set(tags)];
      const matchedTags = await this.userRepository.find({
        filter: { _id: { $in: tagsSet } },
      });
      if (matchedTags?.length != tagsSet.length) {
        throw new NotFoundException("Fail to find mention accounts");
      }
      for (const tag of tagsSet) {
        mentions.push(Types.ObjectId.createFromHexString(tag));
        (await this.redis.getFCMs({ userId: tag })).map((ele) => {
          FCM_TOKENs.push(ele);
        });
      }
    }
    const post = targetComment.postId as HydratedDocument<IPost>;
    let folderId = post.folderId;
    let attachments: Array<string> = [];
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
      } as any,
    });
    if (!reply) {
      if (attachments.length) {
        await this.s3.deleteAssets({
          Keys: attachments.map((ele) => {
            return { Key: ele };
          }),
        });
      }

      throw new BadRequestException("Can't upload this post");
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

export const commentService = new CommentService();
