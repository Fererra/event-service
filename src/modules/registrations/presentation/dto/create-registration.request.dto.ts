export interface CreateRegistrationRequestDto {
  ticketId: number;
}

export const CreateRegistrationSchema = {
  params: {
    type: "object",
    required: ["eventId"],
    properties: {
      eventId: { type: "integer", minimum: 1 },
    },
  },
  body: {
    type: "object",
    required: ["ticketId"],
    properties: {
      ticketId: { type: "integer", minimum: 1 },
    },
  },
};
