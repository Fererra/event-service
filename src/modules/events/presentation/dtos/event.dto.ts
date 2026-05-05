import { TicketType } from "../../../tickets/domain/value-objects/ticket-type.enum";

const ticketTypeValues = [TicketType.REGULAR, TicketType.VIP, TicketType.EARLY_BIRD] as const;
type TicketTypeValue = (typeof ticketTypeValues)[number];

export interface CreateTicketInlineDto {
  type: TicketTypeValue;
  limit: number;
  price: number;
}

export interface CreateEventDto {
  name: string;
  organisator: string;
  description: string;
  start_timestamp: string;
  end_timestamp: string;
  venue_id: string;
  tickets?: CreateTicketInlineDto[];
}

export interface UpdateEventDto {
  name?: string;
  organisator?: string;
  description?: string;
  start_timestamp?: string;
  end_timestamp?: string;
  venue_id?: string;
}

const ticketInlineSchema = {
  type: "object",
  required: ["type", "limit", "price"],
  properties: {
    type: { type: "string", enum: ticketTypeValues },
    limit: { type: "integer", minimum: 1 },
    price: { type: "number", minimum: 0 },
  },
} as const;

export const createEventSchema = {
  body: {
    type: "object",
    required: [
      "name",
      "organisator",
      "description",
      "start_timestamp",
      "end_timestamp",
      "venue_id",
    ],
    properties: {
      name: { type: "string", minLength: 1 },
      organisator: { type: "string", minLength: 1 },
      description: { type: "string" },
      start_timestamp: { type: "string", format: "date-time" },
      end_timestamp: { type: "string", format: "date-time" },
      venue_id: { type: "string", minLength: 1, format: "uuid" },
      tickets: {
        type: "array",
        items: ticketInlineSchema,
      },
    },
  },
} as const;

export const updateEventSchema = {
  body: {
    type: "object",
    properties: {
      name: { type: "string", minLength: 1 },
      organisator: { type: "string", minLength: 1 },
      description: { type: "string" },
      start_timestamp: { type: "string", format: "date-time" },
      end_timestamp: { type: "string", format: "date-time" },
      venue_id: { type: "string", minLength: 1 },
    },
  },
} as const;
