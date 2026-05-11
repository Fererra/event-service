export interface GetRegistrationsCountRequestDto {
  eventId: number;
  ticketId: number;
}

export interface RegistrationsCountResponseDto {
  count: number;
}
