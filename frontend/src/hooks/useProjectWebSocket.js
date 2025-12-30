import { useState, useEffect, useRef } from 'react';

export const useProjectWebSocket = (projectId) => {
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const ws = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!projectId || !token) return;

        // Determine WS URL (handle both dev and prod/local)
        // Adjust port if needed. Assuming backend is on 8000.
        // In Vite, inputting VITE_API_BASE_URL might be useful, but often it's http, so we need ws replacement.
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const wsUrl = baseUrl.replace(/^http/, 'ws') + `/ws/projects/${projectId}?token=${token}`;

        console.log("Connecting to WS:", wsUrl);
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log("WebSocket Connected");
            setIsConnected(true);
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("WS Message:", data);
                setLastMessage(data);
            } catch (err) {
                console.error("Failed to parse WS message:", err);
            }
        };

        socket.onclose = () => {
            console.log("WebSocket Disconnected");
            setIsConnected(false);
        };

        socket.onerror = (error) => {
            console.error("WebSocket Error:", error);
        };

        ws.current = socket;

        return () => {
            socket.close();
        };
    }, [projectId]);

    return { isConnected, lastMessage };
};
