
import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface WSMessage {
  type: 'subscribe' | 'unsubscribe' | 'data';
  channel?: string;
  data?: any;
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ 
    server,
    path: '/ws'
  });

  // Store active connections by channel
  const channels = new Map<string, Set<WebSocket>>();

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');
    
    const userChannels = new Set<string>();

    ws.on('message', (message: string) => {
      try {
        const msg: WSMessage = JSON.parse(message.toString());

        switch (msg.type) {
          case 'subscribe':
            if (msg.channel) {
              if (!channels.has(msg.channel)) {
                channels.set(msg.channel, new Set());
              }
              channels.get(msg.channel)!.add(ws);
              userChannels.add(msg.channel);
              console.log(`Client subscribed to ${msg.channel}`);
            }
            break;

          case 'unsubscribe':
            if (msg.channel && channels.has(msg.channel)) {
              channels.get(msg.channel)!.delete(ws);
              userChannels.delete(msg.channel);
              console.log(`Client unsubscribed from ${msg.channel}`);
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      // Clean up subscriptions
      userChannels.forEach(channel => {
        if (channels.has(channel)) {
          channels.get(channel)!.delete(ws);
        }
      });
      console.log('WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // Broadcast function to send data to all subscribers of a channel
  const broadcast = (channel: string, data: any) => {
    if (channels.has(channel)) {
      const message = JSON.stringify({
        type: 'data',
        channel,
        data,
        timestamp: new Date().toISOString()
      });

      channels.get(channel)!.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  };

  return { wss, broadcast };
}
