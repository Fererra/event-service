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
