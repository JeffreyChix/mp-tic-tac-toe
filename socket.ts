"use client";

import { io } from "socket.io-client";

export const socket = io({ autoConnect: false });

declare module "socket.io-client" {
  interface Socket {
    sessionID: string;
  }
}
