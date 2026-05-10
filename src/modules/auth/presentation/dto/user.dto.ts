export interface UserResponseDto {
  id: string;
  email: string;
  nickname: string;
  role: string;
  createdAt: string;
}

export interface UsersListResponseDto {
  users: UserResponseDto[];
  total: number;
}

export const getUserSchema = {
  params: {
    type: "object",
    required: ["userId"],
    properties: {
      userId: { type: "string", format: "uuid" },
    },
  },
};
