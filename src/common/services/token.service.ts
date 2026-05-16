import jwt from "jsonwebtoken";
import type { JwtPayload, SignOptions, VerifyOptions } from "jsonwebtoken";
import type { HydratedDocument } from "mongoose";

import { JWT_CONFIG } from "../../config/config.js";

import { randomUUID } from "node:crypto";
import { IUser } from "../interfaces/user.interface.js";
import {
  BadRequestException,
  UnauthorizedException,
} from "../exceptions/domain.exception.js";
import { redisService } from "./redis.service.js";
import { UserRepository } from "../../DB/repository/user.repository.js";
import { TokenTypeEnum } from "../enums/security.enums.js";
import { RoleEnum } from "../enums/user.enums.js";

export class TokenService {
  private redis = redisService;
  private userRepository: UserRepository;
  constructor() {
    this.userRepository = new UserRepository();
  }

  //detect token signature level
  public async detectTokenSignatureLevel({
    role,
  }: {
    role: RoleEnum;
  }): Promise<{
    accessSignature: string;
    refreshSignature: string;
  }> {
    let accessSignature: string;
    let refreshSignature: string;
    switch (role) {
      case RoleEnum.ADMIN:
        accessSignature = JWT_CONFIG.ADMIN.ACCESS_SECRET;
        refreshSignature = JWT_CONFIG.ADMIN.REFRESH_SECRET;
        break;

      default:
        accessSignature = JWT_CONFIG.User.ACCESS_SECRET;
        refreshSignature = JWT_CONFIG.User.REFRESH_SECRET;
        break;
    }

    return { accessSignature, refreshSignature };
  }

  //get token signature
  public async getTokenSignature({
    tokenType = TokenTypeEnum.ACCESS,
    role,
  }: {
    tokenType?: TokenTypeEnum;
    role: RoleEnum;
  }): Promise<string> {
    const { accessSignature, refreshSignature } =
      await this.detectTokenSignatureLevel({ role });

    return tokenType === TokenTypeEnum.REFRESH
      ? refreshSignature
      : accessSignature;
  }

  //generate token
  public async sign({
    payload,
    secret = JWT_CONFIG.User.ACCESS_SECRET,
    options,
  }: {
    payload: string | object;
    secret?: string;
    options?: SignOptions;
  }): Promise<string> {
    return jwt.sign(payload, secret, options);
  }

  //verify token
  public async verify({
    token,
    secret = JWT_CONFIG.User.ACCESS_SECRET,
    options,
  }: {
    token: string;
    secret?: string;
    options?: VerifyOptions;
  }): Promise<JwtPayload> {
    return jwt.verify(token, secret, options) as JwtPayload;
  }

  //create login credentials
  public async createLoginCredentials({
    user,
    issuer = JWT_CONFIG.ISSUER,
  }: {
    user: HydratedDocument<IUser>;
    issuer?: string;
  }): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const { accessSignature, refreshSignature } =
      await this.detectTokenSignatureLevel({
        role: user.role,
      });
    const jwtid = randomUUID();
    const accessToken = await this.sign({
      payload: { sub: user._id },
      secret: accessSignature,
      options: {
        expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
        jwtid,
        issuer,
        audience: [
          TokenTypeEnum.ACCESS as unknown as string,
          user.role as unknown as string,
        ],
      },
    });
    const refreshToken = await this.sign({
      payload: { sub: user._id },
      secret: refreshSignature,
      options: {
        expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
        jwtid,
        issuer,
        audience: [
          TokenTypeEnum.REFRESH as unknown as string,
          user.role as unknown as string,
        ],
      },
    });

    return { accessToken, refreshToken };
  }

  //decode token
  public async decodeToken({
    token,
    tokenType = TokenTypeEnum.ACCESS,
  }: {
    token: string;
    tokenType?: TokenTypeEnum;
  }): Promise<{ user: HydratedDocument<IUser>; decode: JwtPayload }> {
    //check if token exist
    if (!token) {
      throw new BadRequestException(`no token passed`);
    }
    //decode token
    const decode = jwt.decode(token) as JwtPayload;
    if (!decode?.aud?.length) {
      throw new UnauthorizedException("Missing token audience");
    }
    if (decode.iss !== JWT_CONFIG.ISSUER) {
      throw new UnauthorizedException("jwt issuer invalid");
    }
    const [tokenTypeAud, userRole] = decode.aud as unknown as [
      TokenTypeEnum,
      RoleEnum,
    ];
    if (tokenType !== tokenTypeAud) {
      throw new BadRequestException("invalid token type");
    }
    //verify token
    const secret = await this.getTokenSignature({
      tokenType,
      role: userRole,
    });
    const verifiedData = await this.verify({
      token,
      secret,
      options: { issuer: JWT_CONFIG.ISSUER },
    });
    //check user exist
    const user = await this.userRepository.findOne({
      filter: { _id: verifiedData.sub, confirmEmail: { $exists: true } },
    });
    if (!user) {
      throw new UnauthorizedException(
        "please register or confirm your email first",
      );
    }
    //check if user logged out from token
    const revokeTokenKey = this.redis.revokeTokenKey({
      userId: verifiedData.sub as string,
      jti: decode.jti as string,
    });
    const isLogoutFromToken = await this.redis.get({ key: revokeTokenKey });
    if (isLogoutFromToken) {
      throw new BadRequestException("please login first");
    }
    //check change credentials time
    if (
      user.changeCredentialsTime &&
      (decode.iat as number) * 1000 + 1000 <
        user.changeCredentialsTime.getTime()
    ) {
      throw new BadRequestException("please login first");
    }

    return { user, decode };
  }
}
