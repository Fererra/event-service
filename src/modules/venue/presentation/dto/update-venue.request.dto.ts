export const UpdateVenueSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", format: "uuid" },
    },
  },
  body: {
    type: "object",
    properties: {
      name: { type: "string", minLength: 1 },
      capacity: { type: ["number", "null"], minimum: 0 },
      address: { type: "string", minLength: 1 },
    },
    additionalProperties: false,
  },
};

export interface UpdateVenueRequestDto {
  Params: {
    id: string;
  };
  Body: {
    name?: string;
    capacity?: number | null;
    address?: string;
  };
}
