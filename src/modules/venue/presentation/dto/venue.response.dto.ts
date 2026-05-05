export const VenueResponseSchema = {
  type: "object",
  required: ["id", "name", "address"],
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    capacity: { type: ["number", "null"] },
    address: { type: "string" },
  },
  additionalProperties: false,
};

export interface VenueResponseDto {
  id: string;
  name: string;
  capacity: number | null;
  address: string;
}
