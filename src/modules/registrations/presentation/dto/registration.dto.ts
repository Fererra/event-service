export interface CreateRegistrationDto {
  ticket_id: number;
}

export const createRegistrationSchema = {
  body: {
    type: "object",
    required: ["ticket_id"],
    properties: {
      ticket_id: { type: "integer", minimum: 1 },
    },
  },
};
