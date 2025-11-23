export interface LoginResponseDto {
  email: string;
  fullName?: string;
  accessToken: string;
  accessTokenExpire: number | string;
  isFirstTimeLogin?: boolean;
  refreshToken?: string;
  refreshTokenExpire?: number | string;
  platform?: string[];
}
