import { useEffect, useCallback } from 'react';
import websocketService from '../services/websocket';

export const useWebSocket = (channel: string, messageType: string, onMessage: (data: any) => void) => {
  const handleMessage = useCallback((data: any) => {
    onMessage(data);
  }, [onMessage]);

  useEffect(() => {
    // Connect to the specified channel
    websocketService.connect(channel);

    // Subscribe to messages of the specified type
    websocketService.subscribe(messageType, handleMessage);

    // Cleanup on unmount
    return () => {
      websocketService.unsubscribe(messageType, handleMessage);
      websocketService.disconnect();
    };
  }, [channel, messageType, handleMessage]);

  // Return function to send messages
  const sendMessage = useCallback((data: any) => {
    websocketService.send(data);
  }, []);

  return { sendMessage };
};