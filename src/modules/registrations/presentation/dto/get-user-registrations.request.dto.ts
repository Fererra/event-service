import { RegistrationArrayResponseSchema } from "./registration.response.dto";

export const GetUserRegistrationsSchema = {
  params: {
    type: "object",
    required: ["userId"],
    properties: {
      userId: { type: "string", format: "uuid" },
    },
  },
  response: {
    200: RegistrationArrayResponseSchema,
  },
};
