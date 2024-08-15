"use client";

import { useEffect, useState, useCallback } from "react";
import { socket } from "../../socket";
import { CONNECT, DISCONNECT } from "@/lib/socket/utils";

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off(CONNECT, onConnect);
      socket.off(DISCONNECT, onDisconnect);
    };
  }, []);

  const emit = useCallback(
    (event: string, data?: any, cb?: () => void) => {
      try {
        socket.emit(event, data, (err: any, response: any) => {
          if (err) {
            throw new Error(err);
          } else {
            cb?.();
          }
        });
      } catch (err) {
        console.error("An error occurred! => ", err);
      }
    },
    []
  );

  const listen = useCallback(
    (event: string, callback: (...args: any[]) => void) => {
      socket.on(event, callback);

      return () => {
        socket.off(event, callback);
      };
    },
    []
  );

  return { emit, listen, socket };
}
