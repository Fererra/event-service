import { RegistrationResponseSchema } from "./registration.response.dto";

export const GetEventRegistrationSchema = {
  params: {
    type: "object",
    required: ["eventId", "registrationId"],
    properties: {
      eventId: { type: "integer", minimum: 1 },
      registrationId: { type: "string", format: "uuid" },
    },
  },
  response: {
    200: RegistrationResponseSchema,
  },
};
