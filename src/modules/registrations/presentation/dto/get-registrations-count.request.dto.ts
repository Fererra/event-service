export const GetRegistrationsCountSchema = {
  params: {
    type: "object",
    properties: {
      eventId: { type: "integer", minimum: 1 },
      ticketId: { type: "integer", minimum: 1 },
    },
    required: ["eventId", "ticketId"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        eventId: { type: "integer" },
        ticketId: { type: "integer" },
        count: { type: "integer" },
      },
      required: ["eventId", "ticketId", "count"],
    },
  },
};
