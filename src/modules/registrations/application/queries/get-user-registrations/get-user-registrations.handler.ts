import { RegistrationReadRepository } from "../../repositories/registration-read.repository";
import { GetUserRegistrationsQuery } from "./get-user-registrations.query";
import { RegistrationDetailModel } from "../registration-detail.model";
import { UserRole } from "../../../../../shared/domain/value-objects/user-role.enum";
import { DomainError } from "../../../../../shared/domain/errors/domain.error";

export class GetUserRegistrationsQueryHandler {
  constructor(private readonly readRepository: RegistrationReadRepository) {}

  async handle(query: GetUserRegistrationsQuery): Promise<RegistrationDetailModel[]> {
    if (query.executorRole !== UserRole.ADMIN && query.executorId !== query.userId) {
      throw new DomainError("You don't have permission to view these registrations");
    }

    return this.readRepository.findByUserId(query.userId);
  }
}
