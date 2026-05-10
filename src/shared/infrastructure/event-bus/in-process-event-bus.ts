import { IntegrationEvent } from "../../domain/events/integration-event";
import { IEventBus } from "../../application/ports/event-bus.interface";

export class InProcessEventBus implements IEventBus {
  private readonly handlers = new Map<string, Array<(event: any) => Promise<void>>>();

  subscribe<T extends IntegrationEvent>(
    eventClass: new (...args: any[]) => T,
    handler: (event: T) => Promise<void>,
  ): void {
    const key = eventClass.name;
    if (!this.handlers.has(key)) {
      this.handlers.set(key, []);
    }
    this.handlers.get(key)!.push(handler);
  }

  async publish(event: IntegrationEvent): Promise<void> {
    const key = event.constructor.name;
    const eventHandlers = this.handlers.get(key) ?? [];
    await Promise.all(eventHandlers.map((handler) => handler(event)));
  }
}
