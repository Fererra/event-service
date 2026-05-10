export abstract class IntegrationEvent {
  readonly occurredAt: Date;

  constructor() {
    this.occurredAt = new Date();
  }
}
