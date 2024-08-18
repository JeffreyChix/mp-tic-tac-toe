import crypto from "crypto";

import { BoardState } from "../type";

export const generateRandomId = () => crypto.randomBytes(8).toString("hex");

export function generateBoardId() {
  return Math.random().toString(36).substring(2, 9);
}

export function isBoardMember(board: BoardState, sessionID: string) {
  return sessionID === board.player.id || sessionID === board.opponent?.id;
}

export function updateBoardConnections(board: BoardState, sessionID: string) {
  if (!board.connectedPlayers.includes(sessionID)) {
    board.connectedPlayers.push(sessionID);
  }
}
