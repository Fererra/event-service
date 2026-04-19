export interface TokenPayload {
  sub: string; // userId
  email: string;
  role: string;
  type: "access" | "refresh";
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface TokenService {
  generateTokenPair(userId: string, email: string, role: string): TokenPair;
  verifyAccessToken(token: string): TokenPayload;
  verifyRefreshToken(token: string): TokenPayload;
  hashToken(token: string): string;
}
