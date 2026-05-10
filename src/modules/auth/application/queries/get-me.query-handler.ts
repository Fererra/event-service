import { NotFoundError } from "../../../../shared/domain/errors/domain.error";
import { IUserReadRepository } from "../ports/user-read.repository";
import { UserReadModel } from "./read-models/user.read-model";

export interface GetMeQuery {
  userId: string;
}

export class GetMeQueryHandler {
  constructor(private readonly userReadRepository: IUserReadRepository) {}

  async handle(query: GetMeQuery): Promise<UserReadModel> {
    const user = await this.userReadRepository.findById(query.userId);

    if (!user) {
      throw new NotFoundError(`User ${query.userId} not found`);
    }

    return user;
  }
}
