"use client";

import { RefObject, useEffect, useRef } from "react";

import { useGameSession } from "@/hooks/useGameSession";
import { GameMode, GameScores } from "../../../type";

export function ScoreBoard() {
  const {
    session: { scores, gameMode, player, opponent },
  } = useGameSession();

  const currentScores = scores[gameMode];

  const playerScoreSpanRef = useRef<HTMLSpanElement>(null);
  const tieScoreSpanRef = useRef<HTMLSpanElement>(null);
  const opponentScoreRef = useRef<HTMLSpanElement>(null);

  const prevScores = useRef<GameScores[GameMode]>({ ...currentScores });

  useEffect(() => {
    const handlePopAnimation = (ref: RefObject<HTMLSpanElement>) => {
      ref.current?.classList.add("zoom-fade-animation");

      setTimeout(() => {
        ref.current?.classList.remove("zoom-fade-animation");
      }, 600);
    };

    if (currentScores.player > prevScores.current.player) {
      handlePopAnimation(playerScoreSpanRef);
    }

    if (currentScores.tie > prevScores.current.tie) {
      handlePopAnimation(tieScoreSpanRef);
    }

    if (currentScores.opponent > prevScores.current.opponent) {
      handlePopAnimation(opponentScoreRef);
    }

    prevScores.current = currentScores;
  }, [currentScores]);

  return (
    <div className="flex items-center gap-8 justify-between ml-28">
      <div className="flex flex-col items-center justify-center">
        <span className="text-xs">{player.username}</span>
        <div className="score-box">
          <span ref={playerScoreSpanRef} className="score">
            {currentScores.player}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <span className="text-xs">Ties</span>
        <div className="score-box">
          <span ref={tieScoreSpanRef} className="score">
            {currentScores.tie}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <span className="text-xs">
          {gameMode === "modeLive" && opponent.username === "Computer"
            ? "Waiting..."
            : opponent.username}
        </span>
        <div className="score-box">
          <span ref={opponentScoreRef} className="score">
            {currentScores.opponent}
          </span>
        </div>
      </div>
    </div>
  );
}
