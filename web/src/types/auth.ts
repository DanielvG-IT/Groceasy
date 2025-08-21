// .NET Core
export type loginDto = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export type registerDto = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type tokenResponseDto = {
  accessToken: string;
  accessTokenExpiry: Date;
  refreshToken: string;
  refreshTokenExpiry: Date;
};

// NextJS
export type RegisterModel = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};
