export interface RegistrationResponseDto {
  id: string;
  userId: string;
  ticketId: number;
  registrationTimestamp: string;
}

export const RegistrationResponseSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    userId: { type: "string", format: "uuid" },
    ticketId: { type: "integer", minimum: 1 },
    registrationTimestamp: { type: "string", format: "date-time" },
  },
};

export const RegistrationArrayResponseSchema = {
  type: "array",
  items: RegistrationResponseSchema,
};
