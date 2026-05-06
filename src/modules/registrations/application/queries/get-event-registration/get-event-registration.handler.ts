import { RegistrationReadRepository } from "../../repositories/registration-read.repository";
import { GetEventRegistrationQuery } from "./get-event-registration.query";
import { RegistrationDetailModel } from "../registration-detail.model";
import { NotFoundError } from "../../../../../shared/domain/errors/domain.error";
import { EventInfoRepositoryAdapter } from "../../../infrastructure/adapters/event-info.repository.adapter";

export class GetEventRegistrationQueryHandler {
  constructor(
    private readonly readRepository: RegistrationReadRepository,
    private readonly eventInfoRepository: EventInfoRepositoryAdapter,
  ) {}

  async handle(query: GetEventRegistrationQuery): Promise<RegistrationDetailModel> {
    const event = await this.eventInfoRepository.findById(query.eventId);
    if (!event) {
      throw new NotFoundError(`Event with id ${query.eventId} not found`);
    }

    const registration = await this.readRepository.findByIdAndEventId(
      query.registrationId,
      query.eventId,
    );

    if (!registration) {
      throw new NotFoundError(`Registration with id ${query.registrationId} not found`);
    }

    return registration;
  }
}
