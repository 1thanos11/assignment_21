import { LogoutEnum } from "../../common/enums/security.enums.js";
import {
  ConflictException,
  NotFoundException,
} from "../../common/exceptions/domain.exception.js";
import { IUser } from "../../common/interfaces/user.interface.js";
import { redisService } from "../../common/services/redis.service.js";
import { s3Service } from "../../common/services/s3.service.js";
import { SecurityService } from "../../common/services/security.service.js";
import { TokenService } from "../../common/services/token.service.js";
import { JWT_CONFIG } from "../../config/config.js";
import { UserRepository } from "../../DB/repository/user.repository.js";
import {
  CoverImagesDto,
  IAuthDto,
  LogoutDto,
  ProfileImageDto,
  ShareProfileDto,
} from "./user.dto.js";

export class UserService {
  constructor(
    private readonly userRepository = new UserRepository(),
    private readonly securityService = new SecurityService(),
    private readonly tokenService = new TokenService(),
    private readonly redis = redisService,
    private readonly s3 = s3Service,
  ) {}
  //refresh token
  public async refreshToken(inputs: IAuthDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const { user, decode } = inputs;
    const userId = user._id.toString();
    if (
      Date.now() + 30000 <
      ((decode?.iat as number) + JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN) * 1000
    ) {
      throw new ConflictException("previous token is still valid");
    }
    const revokeTokenKey = this.redis.revokeTokenKey({
      userId,
      jti: decode?.jti as string,
    });
    await this.redis.set({
      key: revokeTokenKey,
      value: decode?.jti,
      time: (decode?.iat as number) + JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
    });

    return await this.tokenService.createLoginCredentials({ user });
  }

  //profile
  // public async profile(inputs: IAuthDto): Promise<IUser> {
  //   const { user } = inputs;
  //   if (user.phone) {
  //     user.phone = await this.securityService.decrypt({
  //       encryptedData: user.phone,
  //     });
  //   }

  //   return user.toJSON();
  // }
  public async profile(inputs: IAuthDto): Promise<IUser | null> {
    const { user } = inputs;

    const profile = await this.userRepository.findOne({
      filter: { _id: user._id },
      options: {
        populate: [
          {
            path: "friends",
            select: "firstName lastName username profilePicture",
          },
        ],
      },
    });

    if (!profile) {
      throw new NotFoundException("user not found");
    }

    if (profile.phone) {
      profile.phone = await this.securityService.decrypt({
        encryptedData: profile.phone,
      });
    }

    return profile.toJSON();
  }

  //logout
  public async logout(inputs: LogoutDto & IAuthDto): Promise<void> {
    const { user, decode, flag } = inputs;
    switch (flag) {
      case LogoutEnum.ALL:
        user.changeCredentialsTime = new Date();
        await user.save();
        const keys = await this.redis.keys({
          pattern: `${this.redis.baseRevokeToken({
            userId: user._id,
          })}*`,
        });
        await this.redis.del({ keys });
        break;

      default:
        const revokeTokenKey = this.redis.revokeTokenKey({
          userId: user._id,
          jti: decode?.jti as string,
        });
        await this.redis.set({
          key: revokeTokenKey,
          value: decode?.jti,
          time: (decode?.iat as number) + JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
        });
        break;
    }

    return;
  }

  //share profile
  public async shareProfile(inputs: ShareProfileDto): Promise<any> {
    const { id } = inputs;
    const targetUser = await this.userRepository.findOne({
      filter: { _id: id, confirmEmail: { $exists: true } },
      projection:
        "-email -password -confirmEmail -role -provider -changeCredentialsTime -_id -updatedAt -__v",
    });
    if (!targetUser) {
      throw new NotFoundException("user not found");
    }
    if (targetUser.phone) {
      targetUser.phone = await this.securityService.decrypt({
        encryptedData: targetUser.phone,
      });
    }

    return targetUser;
  }

  //profile image
  public async uploadProfileImage(
    inputs: ProfileImageDto,
  ): Promise<{ url: string; Key: string }> {
    const { user, ContentType, Originalname } = inputs;
    const oldPic = user.profilePicture;
    const { url, Key } = await this.s3.createPreSignedUploadUrl({
      path: `Users/${user._id.toString()}/Profile`,
      ContentType,
      Originalname,
    });
    user.profilePicture = Key;
    await user.save();
    if (oldPic) {
      await this.s3.deleteAsset({ Key: oldPic });
    }

    return { url, Key };
  }

  //cover images
  public async uploadCoverImages(inputs: CoverImagesDto): Promise<void> {
    const { user, attachments } = inputs;
    const oldUrls = user.coverPictures;
    const urls = await this.s3.uploadAssets({
      files: attachments,
      path: `Users/${user._id.toString()}/Profile/Cover`,
    });
    user.coverPictures = urls;
    await user.save();
    if (oldUrls?.length) {
      await this.s3.deleteAssets({
        Keys: oldUrls.map((ele) => {
          return { Key: ele };
        }),
      });
    }

    return;
  }
}

export const userService = new UserService();
