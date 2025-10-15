
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
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onopen = () => {
      console.log(`WebSocket connected to ${channel}`);
      setIsConnected(true);
      
      // Subscribe to channel
      ws.send(JSON.stringify({
        type: 'subscribe',
        channel
      }));
    };

    ws.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        if (message.channel === channel) {
          setData(message.data);
        }
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      // Reconnect after 3 seconds
      setTimeout(() => {
        connect();
      }, 3000);
    };

    wsRef.current = ws;
  }, [channel]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: 'unsubscribe',
          channel
        }));
        wsRef.current.close();
      }
    };
  }, [channel, connect]);

  return { data, isConnected };
}
