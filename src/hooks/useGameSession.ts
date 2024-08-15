"use client";

import { useContext } from "react";

import { GameSessionContext } from "@/contexts/game-session";

export function useGameSession() {
  return useContext(GameSessionContext);
}
