export const CreateRegistrationSchema = {
  params: {
    type: "object",
    required: ["eventId"],
    properties: {
      eventId: { type: "string", pattern: "^[0-9]+$" },
    },
  },
  body: {
    type: "object",
    required: ["ticket_id"],
    properties: {
      ticket_id: { type: "integer", minimum: 1 },
    },
  },
};

export type CreateRegistrationRoute = {
  Params: {
    eventId: string;
  };
  Body: {
    ticket_id: number;
  };
};

export const GetUserRegistrationsSchema = {
  params: {
    type: "object",
    required: ["userId"],
    properties: {
      userId: { type: "string", format: "uuid" },
    },
  },
};

export type GetUserRegistrationsRoute = {
  Params: {
    userId: string;
  };
};

export const GetUserRegistrationSchema = {
  params: {
    type: "object",
    required: ["userId", "registrationId"],
    properties: {
      userId: { type: "string", format: "uuid" },
      registrationId: { type: "string", format: "uuid" },
    },
  },
};

export type GetUserRegistrationRoute = {
  Params: {
    userId: string;
    registrationId: string;
  };
};

export const GetEventRegistrationsSchema = {
  params: {
    type: "object",
    required: ["eventId"],
    properties: {
      eventId: { type: "string", pattern: "^[0-9]+$" },
    },
  },
};

export type GetEventRegistrationsRoute = {
  Params: {
    eventId: string;
  };
};

export const GetEventRegistrationSchema = {
  params: {
    type: "object",
    required: ["eventId", "registrationId"],
    properties: {
      eventId: { type: "string", pattern: "^[0-9]+$" },
      registrationId: { type: "string", format: "uuid" },
    },
  },
};

export type GetEventRegistrationRoute = {
  Params: {
    eventId: string;
    registrationId: string;
  };
};

export const GetRegistrationsCountSchema = {
  params: {
    type: "object",
    required: ["eventId", "ticketId"],
    properties: {
      eventId: { type: "string", pattern: "^[0-9]+$" },
      ticketId: { type: "string", pattern: "^[0-9]+$" },
    },
  },
};

export type GetRegistrationsCountRoute = {
  Params: {
    eventId: string;
    ticketId: string;
  };
};

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

export type CancelRegistrationRoute = {
  Params: { userId: string; registrationId: string };
};
