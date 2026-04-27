import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'notifications',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('NotificationGateway');

  handleConnection(client: Socket) {
    const tenantId = client.handshake.query.tenantId as string;
    if (tenantId) {
      client.join(tenantId);
      this.logger.debug(`Client ${client.id} joined room: ${tenantId}`);
    } else {
      this.logger.warn(`Client ${client.id} connected without tenantId`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    return { event: 'pong', data };
  }

  sendToTenant(tenantId: string, event: string, payload: any) {
    this.server.to(tenantId).emit(event, payload);
  }
}
