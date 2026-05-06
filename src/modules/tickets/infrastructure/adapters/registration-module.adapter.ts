import { IRegistrationCountRepository } from "../../domain/repositories/registration-count.repository.interface";
import { GetRegistrationsCountQueryHandler } from "../../../registrations/application/queries/get-registrations-count/get-registrations-count.handler";
import { GetRegistrationsCountQuery } from "../../../registrations/application/queries/get-registrations-count/get-registrations-count.query";

export class RegistrationModuleAdapter implements IRegistrationCountRepository {
  constructor(private readonly getRegistrationsCountUseCase: GetRegistrationsCountQueryHandler) {}
  async countByTicketId(eventId: number, ticketId: number): Promise<number> {
    const count = await this.getRegistrationsCountUseCase.handle(
      new GetRegistrationsCountQuery(eventId, ticketId),
    );

    return count;
  }
}
