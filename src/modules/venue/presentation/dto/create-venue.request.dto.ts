export const CreateVenueSchema = {
  body: {
    type: "object",
    required: ["name", "address"],
    properties: {
      name: { type: "string", minLength: 1 },
      capacity: { type: ["number", "null"], minimum: 0 },
      address: { type: "string", minLength: 1 },
    },
    additionalProperties: false,
  },
};

export interface CreateVenueRequestDto {
  Body: {
    name: string;
    capacity: number | null;
    address: string;
  };
}
