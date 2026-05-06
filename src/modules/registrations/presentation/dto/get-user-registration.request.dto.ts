import { RegistrationResponseSchema } from "./registration.response.dto";

export const GetUserRegistrationSchema = {
  params: {
    type: "object",
    required: ["userId", "registrationId"],
    properties: {
      userId: { type: "string", format: "uuid" },
      registrationId: { type: "string", format: "uuid" },
    },
  },
  response: {
    200: RegistrationResponseSchema,
  },
};
