import { randomUUID } from "node:crypto";
import {
  BadRequestException,
  NotFoundException,
} from "../../common/exceptions/domain.exception.js";
import { IPost } from "../../common/interfaces/post.interface.js";
import { notificationService } from "../../common/services/notification.service.js";
import { redisService } from "../../common/services/redis.service.js";
import { s3Service } from "../../common/services/s3.service.js";
import { PostRepository } from "../../DB/repository/post.repository.js";
import { UserRepository } from "../../DB/repository/user.repository.js";
import {
  CreatePostDto,
  PostsListDto,
  ReactPostDto,
  UpdatePostDto,
} from "./post.dto.js";
import { HydratedDocument, Types } from "mongoose";
import { IPaginate } from "../../common/interfaces/paginate.interface.js";
import { getAvailability } from "../../common/utils/post.js";

export class PostService {
  constructor(
    private readonly userRepository = new UserRepository(),
    private readonly postRepository = new PostRepository(),
    private readonly redis = redisService,
    private readonly s3 = s3Service,
    private readonly notification = notificationService,
  ) {}

  //create post
  async createPost(inputs: CreatePostDto): Promise<IPost> {
    const { user, content, availability, files, tags } = inputs;
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
    let folderId = randomUUID();
    let attachments: Array<string> = [];
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
      } as any,
    });
    if (!post) {
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
            message: `${user.username} upload new post`,
            post: post._id,
          }),
        },
      });
    }

    return post.toJSON();
  }

  //posts list
  async postsList(
    inputs: PostsListDto,
  ): Promise<IPaginate<HydratedDocument<IPost>>> {
    const { user, page, size, search } = inputs;

    const posts = await this.postRepository.paginate({
      filter: {
        $or: getAvailability(user),
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

  //react post
  async reactPost(inputs: ReactPostDto): Promise<IPost> {
    const { user, postId, react } = inputs;
    const post = await this.postRepository.findOneAndUpdate({
      filter: { _id: postId, $or: getAvailability(user) },
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
      throw new NotFoundException("post not found");
    }

    return post.toJSON();
  }

  //update post
  async updatePost(inputs: UpdatePostDto): Promise<any> {
    const {
      user,
      postId,
      content,
      files,
      removeFiles,
      removeTags,
      tags,
      availability,
    } = inputs;
    const post = await this.postRepository.findOne({
      filter: { _id: postId, createdBy: user._id },
    });
    if (!post) {
      throw new NotFoundException("post not found");
    }
    if (
      !content &&
      !post.content &&
      !files?.length &&
      post.attachments?.length == removeFiles?.length
    ) {
      throw new BadRequestException("we can't leave empty post");
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
    let folderId = post.folderId;
    let attachments: Array<string> = [];
    if (files?.length) {
      attachments = await this.s3.uploadAssets({
        files,
        path: `/Post/${folderId}`,
      });
    }
    const updatePost = await this.postRepository.findOneAndUpdate({
      filter: {
        _id: Types.ObjectId.createFromHexString(postId),
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
                    return Types.ObjectId.createFromHexString(ele);
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

      throw new BadRequestException("Can't upload this post");
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
