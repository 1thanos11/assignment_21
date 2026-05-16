import { Socket } from "socket.io";
import { IAuthDto } from "../../modules/user/user.dto.js";

export interface IAuthSocket extends Socket {
  data: IAuthDto;
}
