import { RegistrationReadRepository } from "../../repositories/registration-read.repository";
import { GetUserRegistrationQuery } from "./get-user-registration.query";
import { RegistrationDetailModel } from "../registration-detail.model";
import { UserRole } from "../../../../../shared/domain/value-objects/user-role.enum";
import { NotFoundError, DomainError } from "../../../../../shared/domain/errors/domain.error";

export class GetUserRegistrationQueryHandler {
  constructor(private readonly readRepository: RegistrationReadRepository) {}

  async handle(query: GetUserRegistrationQuery): Promise<RegistrationDetailModel> {
    if (query.executorRole !== UserRole.ADMIN && query.executorId !== query.userId) {
      throw new DomainError("You don't have permission to view this registration");
    }

    const registration = await this.readRepository.findByIdAndUserId(
      query.registrationId,
      query.userId,
    );

    if (!registration) {
      throw new NotFoundError(`Registration with id ${query.registrationId} not found`);
    }

    return registration;
  }
}
