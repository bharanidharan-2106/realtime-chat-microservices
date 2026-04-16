import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { Message } from './schemas/message.schema';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy,
    @Inject('CHAT_SERVICE') private readonly chatClient: ClientProxy,
  ) {}

  async sendMessage(dto: SendMessageDto, userId: string): Promise<Message> {
    const message = await this.messageModel.create({
      roomId: dto.roomId,
      senderId: userId,
      content: dto.content,
      type: dto.type || 'text',
      readBy: [userId],
    });

    const eventPayload = {
      messageId: message._id,
      roomId: message.roomId,
      senderId: message.senderId,
      content: message.content,
      timestamp: (message as any).createdAt,
    };

    this.notificationClient.emit('message.sent', eventPayload);
    this.chatClient.emit('message.sent', eventPayload);

    return message;
  }

  async getMessages(
    roomId: string,
    limit: number = 50,
    before?: string,
  ): Promise<Message[]> {
    const query: any = { roomId };

    if (before) {
      query._id = { $lt: before };
    }

    return this.messageModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async markAsRead(messageId: string, userId: string): Promise<Message | null> {
    return this.messageModel
      .findByIdAndUpdate(
        messageId,
        { $addToSet: { readBy: userId } },
        { new: true },
      )
      .exec();
  }
}
