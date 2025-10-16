import { useEffect, useRef, useState, useCallback } from 'react';

interface WSMessage {
  type: 'data';
  channel: string;
  data: any;
  timestamp: string;
}

export function useWebSocket(channel: string) {
  const [data, setData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    let reconnectTimeout: NodeJS.Timeout;
    let ws: WebSocket | null = null;

    const connect = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;

        console.log('Connecting to WebSocket:', wsUrl);
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log(`WebSocket connected to ${channel}`);
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const message: WSMessage = JSON.parse(event.data);
            console.log('WebSocket message received:', message);
            if (message.channel === channel && message.type === 'data') {
              setData(message.data);
            }
          } catch (error) {
            console.error('WebSocket message parse error:', error);
          }
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);

          // Reconnect after 3 seconds
          reconnectTimeout = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, 3000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        reconnectTimeout = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (ws) {
        ws.close();
      }
    };
  }, [channel]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [channel, connect]);

  return { data, isConnected };
}