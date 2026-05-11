import { INotificationService } from "./application/ports/notification.service";

export interface EventCancelledNotificationDto {
  eventId: number;
  eventName: string;
  ownerId: string;
}

export class NotificationsApi {
  constructor(private readonly notificationService: INotificationService) {}

  async notifyEventCancelled(dto: EventCancelledNotificationDto): Promise<void> {
    await this.notificationService.sendEventCancelledNotification({
      eventId: dto.eventId,
      eventName: dto.eventName,
      ownerId: dto.ownerId,
    });
  }
}
