export const CreateRegistrationSchema = {
  params: {
    type: "object",
    required: ["eventId"],
    properties: {
      eventId: { type: "integer" },
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

export type CreateRegistrationDto = {
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

export type GetUserRegistrationsDto = {
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

export type GetUserRegistrationDto = {
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
      eventId: { type: "integer" },
    },
  },
};

export type GetEventRegistrationsDto = {
  Params: {
    eventId: number;
  };
};

export const GetEventRegistrationSchema = {
  params: {
    type: "object",
    required: ["eventId", "registrationId"],
    properties: {
      eventId: { type: "integer" },
      registrationId: { type: "string", format: "uuid" },
    },
  },
};

export type GetEventRegistrationDto = {
  Params: {
    eventId: number;
    registrationId: string;
  };
};
