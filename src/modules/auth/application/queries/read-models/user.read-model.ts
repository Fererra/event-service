export interface UserReadModel {
  id: string;
  email: string;
  nickname: string;
  role: string;
  createdAt: string;
}

export interface UserListReadModel {
  users: UserReadModel[];
  total: number;
}
