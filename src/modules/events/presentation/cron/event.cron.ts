import cron from "node-cron";
import { SyncEventStatusesUseCase } from "../../application/commands/sync-event-statuses.use-case";

export class EventCronJobs {
  constructor(private readonly syncEventStatusesUseCase: SyncEventStatusesUseCase) {}

  start(): void {
    cron.schedule("*/30 * * * *", async () => {
      console.log(`[CRON] Running event status sync at ${new Date().toISOString()}`);
      try {
        await this.syncEventStatusesUseCase.execute();
      } catch (error) {
        console.error("[CRON] Error syncing event statuses:", error);
      }
    });
  }
}
