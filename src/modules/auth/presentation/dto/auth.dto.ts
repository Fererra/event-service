export interface SignupRequestDto {
  email: string;
  nickname: string;
  password: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LogoutRequestDto {
  refreshToken: string;
}

export interface RefreshRequestDto {
  refreshToken: string;
}

export interface TokenPairResponseDto {
  accessToken: string;
  refreshToken: string;
}

export interface SignupResponseDto {
  userId: string;
  tokens: TokenPairResponseDto;
}

export interface LoginResponseDto {
  userId: string;
  tokens: TokenPairResponseDto;
}

export const signupSchema = {
  body: {
    type: "object",
    required: ["email", "nickname", "password"],
    properties: {
      email: { type: "string", format: "email", maxLength: 255 },
      nickname: { type: "string", minLength: 3, maxLength: 50 },
      password: { type: "string", minLength: 8, maxLength: 128 },
    },
    additionalProperties: false,
  },
};

export const loginSchema = {
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 1 },
    },
    additionalProperties: false,
  },
};

export const logoutSchema = {
  body: {
    type: "object",
    required: ["refreshToken"],
    properties: {
      refreshToken: { type: "string", minLength: 1 },
    },
    additionalProperties: false,
  },
};

export const refreshSchema = {
  body: {
    type: "object",
    required: ["refreshToken"],
    properties: {
      refreshToken: { type: "string", minLength: 1 },
    },
    additionalProperties: false,
  },
};
