import { userService, UserService } from "../user.service.js";
import { IAuthDto } from "../user.dto.js";

export class UserResolver {
  private readonly userService: UserService;
  constructor() {
    this.userService = userService;
  }

  //sum
  profile = async (
    parent: unknown,
    args: any,
    { user }: IAuthDto,
  ): Promise<any> => {
    const data = userService.profile({ user });

    return { data };
  };
}
