export const CreateVenueSchema = {
  body: {
    type: "object",
    required: ["name", "address"],
    properties: {
      name: { type: "string", minLength: 1 },
      capacity: { type: ["number", "null"], minimum: 1 },
      address: { type: "string", minLength: 1 },
    },
  },
};

export interface CreateVenueDto {
  name: string;
  capacity: number | null;
  address: string;
}

export const GetVenueByIdSchema = {
  params: {
    type: "object",
    required: ["venueId"],
    properties: {
      venueId: { type: "string", format: "uuid" },
    },
  },
};

export type GetVenueByIdDto = {
  Params: {
    venueId: string;
  };
};

export const UpdateVenueSchema = {
  params: {
    type: "object",
    required: ["venueId"],
    properties: {
      venueId: { type: "string", format: "uuid" },
    },
  },
  body: {
    type: "object",
    properties: {
      name: { type: "string", minLength: 1 },
      capacity: { type: "number", minimum: 1, nullable: true },
      address: { type: "string", minLength: 1 },
    },
    additionalProperties: false,
  },
};

export type UpdateVenueDto = {
  Params: {
    venueId: string;
  };
  Body: {
    name?: string;
    capacity?: number | null;
    address?: string;
  };
};

export const DeleteVenueSchema = {
  params: {
    type: "object",
    required: ["venueId"],
    properties: {
      venueId: { type: "string", format: "uuid" },
    },
  },
};

export type DeleteVenueDto = {
  Params: {
    venueId: string;
  };
};
