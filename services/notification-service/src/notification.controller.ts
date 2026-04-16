import {
  Controller,
  Get,
  Patch,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EventPattern, Payload, Ctx } from '@nestjs/microservices';
import { RmqContext } from '@nestjs/microservices';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  @Get('/')
  @UseGuards(JwtAuthGuard)
  async getNotifications(@Req() req: any) {
    return this.notificationService.getNotifications(req.user.userId);
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(@Req() req: any, @Param('id') id: string) {
    await this.notificationService.markAsRead(req.user.userId, id);
    return { success: true };
  }

  @EventPattern('message.sent')
  async handleMessageSent(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: 'new_message',
      roomId: data.roomId,
      senderId: data.senderId,
      content: data.content?.substring(0, 50) || '',
      timestamp: new Date().toISOString(),
    };

    if (data.participants && Array.isArray(data.participants)) {
      for (const participantId of data.participants) {
        if (participantId !== data.senderId) {
          await this.notificationService.addNotification(
            participantId,
            notification,
          );
          this.notificationGateway.sendToUser(participantId, notification);
        }
      }
    }

    channel.ack(originalMsg);
  }

  @EventPattern('user.created')
  async handleUserCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: 'welcome',
      message: `Welcome to the platform, ${data.username || data.email || 'new user'}!`,
      timestamp: new Date().toISOString(),
    };

    if (data.userId) {
      await this.notificationService.addNotification(
        data.userId,
        notification,
      );
      this.notificationGateway.sendToUser(data.userId, notification);
    }

    channel.ack(originalMsg);
  }

  @EventPattern('user.joined_room')
  async handleUserJoinedRoom(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: 'user_joined_room',
      roomId: data.roomId,
      userId: data.userId,
      username: data.username,
      message: `${data.username || 'A user'} joined the room.`,
      timestamp: new Date().toISOString(),
    };

    if (data.participants && Array.isArray(data.participants)) {
      for (const participantId of data.participants) {
        if (participantId !== data.userId) {
          await this.notificationService.addNotification(
            participantId,
            notification,
          );
          this.notificationGateway.sendToUser(participantId, notification);
        }
      }
    }

    channel.ack(originalMsg);
  }

  @EventPattern('user.online')
  async handleUserOnline(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    // Presence updates handled by gateway broadcast
    channel.ack(originalMsg);
  }

  @EventPattern('user.offline')
  async handleUserOffline(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    // Presence updates handled by gateway broadcast
    channel.ack(originalMsg);
  }
}
