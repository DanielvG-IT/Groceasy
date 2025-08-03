export interface loginDto {
  email: string;
  password: string;
  rememberMe: boolean; // ISO string if coming from JSON, or `Date` if parsed
}

export interface registerDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
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
