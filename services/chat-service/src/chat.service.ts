import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { ChatRoom } from './schemas/chat-room.schema';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatRoom.name) private readonly chatRoomModel: Model<ChatRoom>,
    @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy,
  ) {}

  async createRoom(dto: CreateRoomDto, userId: string): Promise<ChatRoom> {
    const participants = dto.participants || [];
    if (!participants.includes(userId)) {
      participants.push(userId);
    }

    const room = await this.chatRoomModel.create({
      name: dto.name,
      type: dto.type || 'group',
      participants,
      createdBy: userId,
    });

    return room;
  }

  async getUserRooms(userId: string): Promise<ChatRoom[]> {
    return this.chatRoomModel
      .find({ participants: userId })
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .exec();
  }

  async getRoomById(roomId: string): Promise<ChatRoom> {
    const room = await this.chatRoomModel.findById(roomId).exec();
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  async joinRoom(roomId: string, userId: string): Promise<ChatRoom> {
    const room = await this.getRoomById(roomId);
    if (!room.participants.includes(userId)) {
      room.participants.push(userId);
      await room.save();

      this.notificationClient.emit('user.joined_room', {
        userId,
        roomId: room._id,
        roomName: room.name,
      });
    }
    return room;
  }

  async leaveRoom(roomId: string, userId: string): Promise<ChatRoom> {
    const room = await this.getRoomById(roomId);
    room.participants = room.participants.filter((p) => p !== userId);
    await room.save();

    this.notificationClient.emit('user.left_room', {
      userId,
      roomId: room._id,
      roomName: room.name,
    });

    return room;
  }

  async updateLastMessage(roomId: string): Promise<void> {
    await this.chatRoomModel.findByIdAndUpdate(roomId, {
      lastMessageAt: new Date(),
    });
  }
}
