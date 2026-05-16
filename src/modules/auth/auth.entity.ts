//signup response
export interface ISignupResponse {
  username: string;
  email: string;
  password: string;
}

//login
export interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
}
