import { OAuth2Client, TokenPayload } from "google-auth-library";
import { EmailEnum } from "../../common/enums/email.enums.js";
import { BadRequestException, ConflictException, NotFoundException } from "../../common/exceptions/domain.exception.js";
import { notificationService } from "../../common/services/notification.service.js";
import { redisService } from "../../common/services/redis.service.js";
import { SecurityService } from "../../common/services/security.service.js";
import { TokenService } from "../../common/services/token.service.js";
import { sendMailEvent } from "../../common/utils/email/event.email.js";
import { emailTemplate } from "../../common/utils/email/template.email.js";
import { generateOtp } from "../../common/utils/otp.js";
import { CLIENT_IDS, OTP_SALT_ROUNd } from "../../config/config.js";
import { UserRepository } from "../../DB/repository/user.repository.js";
import { ProviderEnum } from "../../common/enums/user.enums.js";
import { ConfirmEmailDto, ForgotPasswordDto, LoginDto, ResendConfirmEmailOtpDto, ResetPasswordDto, SignupDto } from "./auth.dto.js";
import { IUser } from "../../common/interfaces/user.interface.js";
import { ILoginResponse } from "./auth.entity.js";

class AuthService {
  private userRepository: UserRepository;
  private readonly securityService: SecurityService;
  private redis = redisService;
  private readonly tokenService: TokenService;
  private readonly notification = notificationService;
  constructor() {
    this.userRepository = new UserRepository();
    this.securityService = new SecurityService();
    this.tokenService = new TokenService();
    this.notification = notificationService;
  }

  //sendEmailOtp
  private async sendEmailOtp({
    email,
    subject = EmailEnum.CONFIRM_EMAIL,
    title,
  }: {
    email: string;
    subject?: EmailEnum;
    title: string;
  }): Promise<undefined> {
    //check is blocked
    const blockKey = this.redis.OtpBlockKey({ email, subject });
    const isBlockedTTL = await this.redis.ttl({ key: blockKey });
    if (isBlockedTTL >= 0) {
      throw new ConflictException(
        `you are blocked please try again after ${isBlockedTTL} seconds`,
      );
    }
    //check attempts count
    const maxAttemptsKey = this.redis.otpMaxAttemptsKey({
      email,
      subject,
    });
    const count = await this.redis.get<number>({ key: maxAttemptsKey });
    if (count && count > 3) {
      await this.redis.set({ key: blockKey, value: 1, time: 10 * 60 });
    }
    await this.redis.incr({ key: maxAttemptsKey });
    //check otp valid
    const otpKey = this.redis.otpKey({ email, subject });
    const isValidOtp = await this.redis.ttl({ key: otpKey });
    if (isValidOtp >= 0) {
      throw new ConflictException("the previous otp is still valid");
    }
    const otp = await generateOtp();
    const hashedOtp = await this.securityService.generateHash({
      data: `${otp}`,
      rounds: OTP_SALT_ROUNd,
    });
    await this.redis.set({ key: otpKey, value: hashedOtp, time: 10 * 60 });
    sendMailEvent.emit("sendMail", {
      to: email,
      html: emailTemplate({ title, code: otp }),
    });

    return;
  }

  //verify google account
  private async verifyGoogleAccount(idToken: string): Promise<TokenPayload> {
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken,
      audience: CLIENT_IDS,
    });
    const payload = ticket.getPayload();
    if (!payload?.email_verified) {
      throw new BadRequestException(
        "Fail to authenticate this account with google",
      );
    }

    return payload;
  }

  //signup with gmail
  public async signupWithGmail(idToken: string): Promise<{
    credentials: { accessToken: string; refreshToken: string };
    status: number;
  }> {
    const payload = await this.verifyGoogleAccount(idToken);
    const isUserExist = await this.userRepository.findOne({
      filter: { email: payload.email as string },
    });
    if (isUserExist) {
      if (isUserExist.provider !== ProviderEnum.GOOGLE) {
        throw new ConflictException("email already exist");
      }

      return {
        status: 200,
        credentials: await this.loginWithGmail(idToken),
      };
    }
    const user = await this.userRepository.createOne({
      data: {
        firstName: payload.given_name as string,
        lastName: payload.family_name as string,
        email: payload.email as string,
        provider: ProviderEnum.GOOGLE,
        profilePicture: payload.profile as string,
        confirmEmail: new Date(),
      },
    });

    return {
      status: 201,
      credentials: await this.tokenService.createLoginCredentials({
        user,
      }),
    };
  }

  //login with gmail
  public async loginWithGmail(idToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload = await this.verifyGoogleAccount(idToken);
    const user = await this.userRepository.findOne({
      filter: {
        email: payload.email as string,
        confirmEmail: { $exists: true },
        provider: ProviderEnum.GOOGLE,
      },
    });
    if (!user) {
      throw new NotFoundException("user not found");
    }

    return await this.tokenService.createLoginCredentials({ user });
  }

  //signup
  public signup = async (inputs: SignupDto): Promise<IUser> => {
    const { username, email, password, phone } = inputs;
    const isUserExist = await this.userRepository.findOne({
      filter: { email: inputs.email },
      projection: "email",
      options: { lean: true },
    });
    if (isUserExist) {
      throw new ConflictException("email already exist");
    }
    const user = await this.userRepository.createOne({
      data: {
        username,
        email,
        password,
        phone,
      },
    });
    await this.sendEmailOtp({ email, title: "Verify Email Otp" });

    return user.toJSON();
  };

  //confirm email
  public async confirmEmail(inputs: ConfirmEmailDto): Promise<void> {
    const { email, otp } = inputs;
    const otpKey = this.redis.otpKey({ email });
    const isOtpExist = await this.redis.get<string>({ key: otpKey });
    if (!isOtpExist) {
      throw new BadRequestException("expired OTP");
    }
    const isValidOtp = await this.securityService.compareHash({
      plaintext: `${otp}`,
      encrypted: isOtpExist,
    });
    if (!isValidOtp) {
      throw new BadRequestException("wrong OTP");
    }
    const user = await this.userRepository.findOneAndUpdate({
      filter: { email, provider: ProviderEnum.SYSTEM, confirmEmail: null },
      update: { confirmEmail: new Date() },
    });
    if (!user) {
      throw new NotFoundException(
        "user not found may be you write wrong email",
      );
    }
    await this.redis.del({
      keys: await this.redis.keys({
        pattern: `${this.redis.otpKey({ email })}*`,
      }),
    });

    return;
  }

  //resend confirm email otp
  public async resendConfirmEmailOtp(
    inputs: ResendConfirmEmailOtpDto,
  ): Promise<void> {
    const { email } = inputs;
    const user = await this.userRepository.findOne({
      filter: { email, provider: ProviderEnum.SYSTEM, confirmEmail: null },
      projection: "email",
      options: { lean: true },
    });
    if (!user) {
      throw new NotFoundException(
        "user not found may be you write wrong email",
      );
    }
    await this.sendEmailOtp({ email, title: "confirm email OTP" });

    return;
  }

  //login
  public async login(inputs: LoginDto): Promise<ILoginResponse> {
    const { email, password, FCM } = inputs;
    const user = await this.userRepository.findOne({
      filter: {
        email,
        confirmEmail: { $exists: true },
        provider: ProviderEnum.SYSTEM,
      },
    });
    if (!user) {
      throw new NotFoundException("email or password is wrong");
    }
    const isCorrectPassword = await this.securityService.compareHash({
      plaintext: password,
      encrypted: user.password as string,
    });
    if (!isCorrectPassword) {
      throw new NotFoundException("email or password is wrong");
    }
    if (FCM) {
      await this.redis.addFCM({ userId: user._id, FCMToken: FCM });
      const tokens = await this.redis.getFCMs({
        userId: user._id,
      });
      await this.notification.sendMultiNotification({
        tokens,
        data: { title: "login attempt", body: "new login session" },
      });
    }

    return await this.tokenService.createLoginCredentials({ user });
  }

  //send forgot password otp
  public async forgotPassword(inputs: ForgotPasswordDto): Promise<void> {
    const { email } = inputs;
    const user = await this.userRepository.findOne({
      filter: {
        email,
        confirmEmail: { $exists: true },
        provider: ProviderEnum.SYSTEM,
      },
    });
    if (!user) {
      throw new NotFoundException(
        "user not found may be you enter invalid email",
      );
    }
    await this.sendEmailOtp({
      title: "Forgot Password OTP",
      subject: EmailEnum.FORGOT_PASSWORD,
      email,
    });

    return;
  }

  //reset password
  public async resetPassword(inputs: ResetPasswordDto): Promise<void> {
    const { email, password, otp } = inputs;
    const user = await this.userRepository.findOne({
      filter: {
        email,
        confirmEmail: { $exists: true },
        provider: ProviderEnum.SYSTEM,
      },
    });
    if (!user) {
      throw new NotFoundException(
        "user not found may be you enter invalid email",
      );
    }
    const otpKey = this.redis.otpKey({
      email,
      subject: EmailEnum.FORGOT_PASSWORD,
    });
    const isOtpExist = await this.redis.get({ key: otpKey });
    if (!isOtpExist) {
      throw new NotFoundException("expired otp");
    }
    const isValidOtp = await this.securityService.compareHash({
      plaintext: `${otp}`,
      encrypted: isOtpExist as string,
    });
    if (!isValidOtp) {
      throw new BadRequestException("wrong otp");
    }
    const hashedPassword = await this.securityService.generateHash({
      data: password,
    });
    user.password = hashedPassword;
    await user.save();
    const keys = await this.redis.keys({
      pattern: `${this.redis.otpKey({ email, subject: EmailEnum.FORGOT_PASSWORD })}*`,
    });
    await this.redis.del({ keys });

    return;
  }
}

export default new AuthService();
