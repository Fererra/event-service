import { RegistrationArrayResponseSchema } from "./registration.response.dto";

export const GetEventRegistrationsSchema = {
  params: {
    type: "object",
    required: ["eventId"],
    properties: {
      eventId: { type: "integer", minimum: 1 },
    },
  },
  response: {
    200: RegistrationArrayResponseSchema,
  },
};
