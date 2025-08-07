// .NET Core
export interface LoginDto {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RefreshRequestDto {
  userId: string;
  refreshToken: string;
}

export interface TokenResponseDto {
  token: string;
  tokenExpiry: Date;
  refreshToken: string;
  refreshTokenExpiry: Date;
}

// Expo
export interface RegisterModel {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}
