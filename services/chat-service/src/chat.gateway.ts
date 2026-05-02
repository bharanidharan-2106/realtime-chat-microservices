import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { Inject } from '@nestjs/common';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
    @Inject('MESSAGE_SERVICE') private readonly messageClient: ClientProxy,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub;
      client.data.email = payload.email;

      // Auto-join all rooms the user belongs to
      const rooms = await this.chatService.getUserRooms(payload.sub);
      for (const room of rooms) {
        client.join(room._id.toString());
      }

      console.log(`Client connected: ${payload.sub}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.data?.userId}`);
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; content: string },
  ) {
    const message = {
      roomId: payload.roomId,
      senderId: client.data.userId,
      content: payload.content,
      timestamp: new Date().toISOString(),
    };

    // Broadcast to all clients in the room
    this.server.to(payload.roomId).emit('new_message', message);

    // Save to message-service via RabbitMQ
    this.messageClient.emit('message.create', {
      roomId: payload.roomId,
      senderId: client.data.userId,
      content: payload.content,
    });

    return message;
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string },
  ) {
    client.join(payload.roomId);
    this.server.to(payload.roomId).emit('user_joined', {
      userId: client.data.userId,
      roomId: payload.roomId,
    });
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string },
  ) {
    client.leave(payload.roomId);
    this.server.to(payload.roomId).emit('user_left', {
      userId: client.data.userId,
      roomId: payload.roomId,
    });
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string },
  ) {
    client.to(payload.roomId).emit('user_typing', {
      userId: client.data.userId,
      roomId: payload.roomId,
    });
  }

  // Handle invitation acceptance to join users to the new room immediately
  @EventPattern('invitation.accepted')
  async handleInvitationAccepted(@Payload() data: { roomId: string; participants: string[] }) {
    // Find all connected sockets for these participants and make them join the room
    const sockets = await this.server.fetchSockets();
    for (const socket of sockets) {
      if (data.participants.includes(socket.data.userId)) {
        socket.join(data.roomId);
        // Tell the client to refresh their room list or navigate
        socket.emit('room_created', { roomId: data.roomId });
      }
    }
  }

  @EventPattern('messages.read')
  async handleMessagesRead(@Payload() data: { roomId: string; userId: string }) {
    this.server.to(data.roomId).emit('messages_read', data);
  }
}
