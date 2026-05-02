import { RegistrationFactory } from "../../../../src/modules/registrations/domain/factories/registration.factory";
import { DomainError, NotFoundError } from "../../../../src/shared/domain/errors/domain.error";

class FakeEventInfoRepository {
  private events = new Map<number, { id: number }>();

  setEvent(id: number): void {
    this.events.set(id, { id });
  }

  async findById(id: number) {
    return this.events.get(id) ?? null;
  }
}

class FakeTicketInfoRepository {
  private tickets = new Map<number, { id: number; eventId: number; limit: number }>();

  setTicket(id: number, eventId: number, limit: number): void {
    this.tickets.set(id, { id, eventId, limit });
  }

  async findById(id: number) {
    return this.tickets.get(id) ?? null;
  }
}

class FakeRegistrationRepository {
  private count = 0;

  setCount(count: number): void {
    this.count = count;
  }

  async countByTicketId(): Promise<number> {
    return this.count;
  }

  async save(registration: any) {
    return registration;
  }

  async countByEventAndTicket(eventId: number, ticketId: number): Promise<number> {
    return 0;
  }

  async findById(id: string): Promise<any> {
    return null;
  }

  async findByUserId(userId: string): Promise<any[]> {
    return [];
  }

  async findByIdAndUserId(id: string, userId: string): Promise<any> {
    return null;
  }

  async findByIdAndEventId(id: string, eventId: number): Promise<any> {
    return null;
  }

  async delete(id: string): Promise<void> {
    // do nothing
  }

  async findByEventId(eventId: number): Promise<any[]> {
    return [];
  }

  async findByTicketId(ticketId: number): Promise<any[]> {
    return [];
  }

  async update(registration: any): Promise<void> {
    // do nothing
  }
}

describe("RegistrationFactory", () => {
  let registrationRepo: FakeRegistrationRepository;
  let eventRepo: FakeEventInfoRepository;
  let ticketRepo: FakeTicketInfoRepository;
  let factory: RegistrationFactory;

  beforeEach(() => {
    registrationRepo = new FakeRegistrationRepository();
    eventRepo = new FakeEventInfoRepository();
    ticketRepo = new FakeTicketInfoRepository();
    factory = new RegistrationFactory(registrationRepo, ticketRepo, eventRepo);
  });

  it("creates a new registration successfully", async () => {
    eventRepo.setEvent(1);
    ticketRepo.setTicket(10, 1, 100);
    registrationRepo.setCount(50);

    const registration = await factory.createNew("user-1", 1, 10);

    expect(registration.id).toBeDefined();
    expect(registration.userId).toBe("user-1");
    expect(registration.ticketId).toBe(10);
    expect(registration.registrationTimestamp).toBeInstanceOf(Date);
  });

  it("generates unique ID for each registration", async () => {
    eventRepo.setEvent(1);
    ticketRepo.setTicket(10, 1, 100);
    registrationRepo.setCount(0);

    const reg1 = await factory.createNew("user-1", 1, 10);
    const reg2 = await factory.createNew("user-2", 1, 10);

    expect(reg1.id).not.toBe(reg2.id);
  });

  it("throws NotFoundError when event does not exist", async () => {
    ticketRepo.setTicket(10, 1, 100);

    await expect(factory.createNew("user-1", 1, 10)).rejects.toThrow(NotFoundError);
  });

  it("throws NotFoundError when ticket does not exist", async () => {
    eventRepo.setEvent(1);

    await expect(factory.createNew("user-1", 1, 10)).rejects.toThrow(NotFoundError);
  });

  it("throws DomainError when ticket does not belong to event", async () => {
    eventRepo.setEvent(1);
    ticketRepo.setTicket(10, 2, 100);

    await expect(factory.createNew("user-1", 1, 10)).rejects.toThrow(DomainError);
  });

  it("throws DomainError when ticket is sold out", async () => {
    eventRepo.setEvent(1);
    ticketRepo.setTicket(10, 1, 100);
    registrationRepo.setCount(100);

    await expect(factory.createNew("user-1", 1, 10)).rejects.toThrow(DomainError);
  });

  it("allows registration when count equals limit minus one", async () => {
    eventRepo.setEvent(1);
    ticketRepo.setTicket(10, 1, 100);
    registrationRepo.setCount(99);

    const registration = await factory.createNew("user-1", 1, 10);

    expect(registration.ticketId).toBe(10);
  });
});
