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

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post('rooms')
  async createRoom(@Body() dto: CreateRoomDto, @Request() req) {
    return this.chatService.createRoom(dto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('rooms')
  async getUserRooms(@Request() req) {
    return this.chatService.getUserRooms(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('rooms/:id')
  async getRoom(@Param('id') id: string) {
    return this.chatService.getRoomById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('rooms/:id/join')
  async joinRoom(@Param('id') id: string, @Request() req) {
    return this.chatService.joinRoom(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('rooms/:id/leave')
  async leaveRoom(@Param('id') id: string, @Request() req) {
    return this.chatService.leaveRoom(id, req.user.userId);
  }

  // RabbitMQ consumer: update lastMessageAt when a message is sent
  @EventPattern('message.sent')
  async handleMessageSent(@Payload() data: { roomId: string }) {
    await this.chatService.updateLastMessage(data.roomId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('invitations')
  async sendInvitation(@Body() dto: { email: string }, @Request() req) {
    const username = req.user.username || req.user.email.split('@')[0];
    return this.chatService.sendInvitation(req.user.userId, req.user.email, username, dto.email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('invitations')
  async getInvitations(@Request() req) {
    return this.chatService.getPendingInvitations(req.user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('invitations/:id/accept')
  async acceptInvitation(@Param('id') id: string, @Request() req) {
    const username = req.user.username || req.user.email.split('@')[0];
    return this.chatService.acceptInvitation(id, req.user.userId, username);
  }

  @UseGuards(JwtAuthGuard)
  @Post('invitations/:id/reject')
  async rejectInvitation(@Param('id') id: string) {
    return this.chatService.rejectInvitation(id);
  }
}
