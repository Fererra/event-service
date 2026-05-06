export const CancelRegistrationSchema = {
  params: {
    type: "object",
    required: ["userId", "registrationId"],
    properties: {
      userId: { type: "string", format: "uuid" },
      registrationId: { type: "string", format: "uuid" },
    },
  },
};
