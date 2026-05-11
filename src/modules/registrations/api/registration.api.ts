import { GetRegistrationsCountQueryHandler } from "../application/queries/get-registrations-count/get-registrations-count.handler";
import { GetRegistrationsCountQuery } from "../application/queries/get-registrations-count/get-registrations-count.query";
import {
  GetRegistrationsCountRequestDto,
  RegistrationsCountResponseDto,
} from "./dto/registration-api.dto";

export class RegistrationApi {
  constructor(private readonly getRegistrationsCountHandler: GetRegistrationsCountQueryHandler) {}

  async getRegistrationsCount(
    dto: GetRegistrationsCountRequestDto,
  ): Promise<RegistrationsCountResponseDto> {
    const query = new GetRegistrationsCountQuery(dto.eventId, dto.ticketId);
    const count = await this.getRegistrationsCountHandler.handle(query);

    return { count };
  }
}
