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
    // WebSocket temporarily disabled - using REST API polling instead
    console.log(`WebSocket disabled for channel: ${channel}`);
    setIsConnected(false);
    return () => {};
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