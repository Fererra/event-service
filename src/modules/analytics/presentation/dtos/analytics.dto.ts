export const eventAnalyticsSchema = {
  params: {
    type: "object",
    required: ["eventId"],
    properties: {
      eventId: { type: "string" },
    },
  },
} as const;
