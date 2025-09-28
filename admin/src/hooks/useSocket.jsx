import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io("http://localhost:8080", {
      withCredentials: true,
    });

    // Handle connection events
    socketRef.current.on('connect', () => {
      console.log('Connected to server');
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return socketRef;
};

export default useSocket;