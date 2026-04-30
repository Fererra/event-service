import cron from "node-cron";
import { SyncEventStatusesUSeCase } from "../../application/commands/sync-event-statuses.use-case";

export class EventCronJobs {
  constructor(private readonly syncEventStatusesUSeCase: SyncEventStatusesUSeCase) {}

  start(): void {
    cron.schedule("*/30 * * * *", async () => {
      console.log(`[CRON] Running event status sync at ${new Date().toISOString()}`);
      try {
        await this.syncEventStatusesUSeCase.execute();
      } catch (error) {
        console.error("[CRON] Error syncing event statuses:", error);
      }
    });
  }
}
