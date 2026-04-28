import { EventStatus } from "../../domain/value-objects/event-status.enum";
import { TicketType } from "../../../tickets/domain/enums/ticket-type.enum";
import { start } from "repl";

export interface CreateTicketInlineDto {
  type: TicketType;
  limit: number;
  price: number;
}

export interface CreateEventDto {
  name: string;
  organisator: string;
  description: string;
  start_timestamp: string;
  end_timestamp: string;
  venue_id: number;
  tickets?: CreateTicketInlineDto[];
}

export interface UpdateEventDto {
  name?: string;
  organisator?: string;
  description?: string;
  start_timestamp?: string;
  end_timestamp?: string;
  status?: EventStatus;
  venue_id?: number;
}

export interface EventResponseDto {
  id: number;
  owner_id: string;
  name: string;
  organisator: string;
  description: string;
  start_timestamp: string;
  end_timestamp: string;
  status: EventStatus;
  venue_id: number;
  created_at: string;
}

const ticketInlineSchema = {
  type: "object",
  required: ["type", "limit", "price"],
  properties: {
    type: { type: "string", enum: Object.values(TicketType) },
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
      venue_id: { type: "integer", minimum: 1 },
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
      status: { type: "string", enum: Object.values(EventStatus) },
      venue_id: { type: "integer", minimum: 1 },
    },
  },
} as const;
