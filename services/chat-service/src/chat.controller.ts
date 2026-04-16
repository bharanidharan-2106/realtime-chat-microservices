import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ChatService } from './chat.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('rooms')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createRoom(@Body() dto: CreateRoomDto, @Request() req) {
    return this.chatService.createRoom(dto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserRooms(@Request() req) {
    return this.chatService.getUserRooms(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getRoom(@Param('id') id: string) {
    return this.chatService.getRoomById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  async joinRoom(@Param('id') id: string, @Request() req) {
    return this.chatService.joinRoom(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/leave')
  async leaveRoom(@Param('id') id: string, @Request() req) {
    return this.chatService.leaveRoom(id, req.user.userId);
  }

  // RabbitMQ consumer: update lastMessageAt when a message is sent
  @EventPattern('message.sent')
  async handleMessageSent(@Payload() data: { roomId: string }) {
    await this.chatService.updateLastMessage(data.roomId);
  }
}
