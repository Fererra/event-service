import { IntegrationEvent } from "../../domain/events/integration-event";

export interface IEventBus {
  publish(event: IntegrationEvent): Promise<void>;
  subscribe<T extends IntegrationEvent>(
    eventClass: new (...args: any[]) => T,
    handler: (event: T) => Promise<void>,
  ): void;
}
