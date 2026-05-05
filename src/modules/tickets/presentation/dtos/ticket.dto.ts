import { TicketType } from "../../domain/value-objects/ticket-type.enum";

export interface CreateTicketDto {
  type: TicketType;
  limit: number;
  price: number;
}

export interface UpdateTicketDto {
  limit?: number;
  price?: number;
}

export const createTicketSchema = {
  body: {
    type: "object",
    required: ["type", "limit", "price"],
    properties: {
      type: { type: "string", enum: Object.values(TicketType) },
      limit: { type: "integer", minimum: 1 },
      price: { type: "number", minimum: 0 },
    },
  },
} as const;

export const updateTicketSchema = {
  body: {
    type: "object",
    properties: {
      limit: { type: "integer", minimum: 1 },
      price: { type: "number", minimum: 0 },
    },
  },
} as const;
