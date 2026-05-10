import { UserReadModel } from "../queries/read-models/user.read-model";

export interface IUserReadRepository {
  findById(id: string): Promise<UserReadModel | null>;
  findAll(): Promise<UserReadModel[]>;
}
