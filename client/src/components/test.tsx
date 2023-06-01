import React, { useRef } from 'react';
import  useWebSocket  from 'react-use-websocket';

const MyComponent = () => {
  const url = 'ws://exemple.com/mon-websocket';
  const { sendJsonMessage, readyState } = useWebSocket(url);
  const webSocketRef = useRef<WebSocket | null>(null);

  const handleSendMessage = () => {
    sendJsonMessage({ message: 'Hello WebSocket!' });
  };

  const handleConnect = () => {
    webSocketRef.current = new WebSocket(url);
  };

  const handleDisconnect = () => {
    if (webSocketRef.current) {
      webSocketRef.current.close();
    }
  };

  return (
    <div>
      <p>WebSocket state: {readyState}</p>
      <button onClick={handleConnect}>Connect</button>
      <button onClick={handleSendMessage}>Send Message</button>
      <button onClick={handleDisconnect}>Disconnect</button>
    </div>
  );
};

export default MyComponent;
