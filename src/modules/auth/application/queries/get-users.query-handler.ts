import { IUserReadRepository } from "../ports/user-read.repository";
import { UserListReadModel } from "./read-models/user.read-model";

export class GetUsersQueryHandler {
  constructor(private readonly userReadRepository: IUserReadRepository) {}

  async handle(): Promise<UserListReadModel> {
    const users = await this.userReadRepository.findAll();

    return {
      users,
      total: users.length,
    };
  }
}
