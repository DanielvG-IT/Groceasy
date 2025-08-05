// .NET Core
export interface loginDto {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface registerDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface refreshRequestDto {
  userId: string;
  refreshToken: string;
}

export interface tokenResponseDto {
  token: string;
  tokenExpiry: Date;
  refreshToken: string;
  refreshTokenExiry: Date;
}

// Expo
export interface RegisterModel {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}
