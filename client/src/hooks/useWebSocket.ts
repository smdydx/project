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
    // Determine WebSocket protocol and host
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Connect to Python FastAPI backend WebSocket (port 8000)
    const wsUrl = `${protocol}//${window.location.hostname}:8000/ws`;

    console.log(`Connecting to WebSocket: ${wsUrl}`);
    const ws = new WebSocket(wsUrl);

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
        wsRef.current.close();
      }
    };
  }, [channel, connect]);

  return { data, isConnected };
}