"use client";

import { RefObject, useEffect, useRef } from "react";
import clsx from "clsx";

import { useGameSession } from "@/hooks/useGameSession";
import { Scores } from "../../../type";

export function ScoreBoard({ isPlayerTurn }: { isPlayerTurn: boolean }) {
  const {
    session: {
      board: { scores, player, opponent, gameMode },
    },
  } = useGameSession();

  const currentScores = scores;

  const playerScoreSpanRef = useRef<HTMLSpanElement>(null);
  const tieScoreSpanRef = useRef<HTMLSpanElement>(null);
  const opponentScoreRef = useRef<HTMLSpanElement>(null);

  const prevScores = useRef<Scores>({ ...currentScores });

  useEffect(() => {
    const handlePopAnimation = (ref: RefObject<HTMLSpanElement>) => {
      ref.current?.classList.add("zoom-fade-animation");

      setTimeout(() => {
        ref.current?.classList.remove("zoom-fade-animation");
      }, 600);
    };

    if (currentScores[player.id] > prevScores.current[player.id]) {
      handlePopAnimation(playerScoreSpanRef);
    }

    if (currentScores.tie > prevScores.current.tie) {
      handlePopAnimation(tieScoreSpanRef);
    }

    if (
      opponent &&
      currentScores[opponent.id] > prevScores.current[opponent.id]
    ) {
      handlePopAnimation(opponentScoreRef);
    }

    prevScores.current = currentScores;
  }, [currentScores, opponent, player.id]);

  return (
    <div className="flex items-center gap-3 sm:gap-8 justify-between md:ml-28">
      <div className="flex flex-col items-center justify-center">
        <span
          className={clsx(
            "text-xs py-[0.5px] px-2 sm:py-1 sm:px-4 rounded-full border border-transparent player-name",
            isPlayerTurn && "active"
          )}
        >
          {player.username}
        </span>
        <div className="score-box">
          <span ref={playerScoreSpanRef} className="score">
            {currentScores[player.id] ?? 0}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <span
          className={"text-xs py-[0.5px] px-2 sm:py-1 sm:px-4 rounded-full border border-transparent"}
        >
          Ties
        </span>
        <div className="score-box">
          <span ref={tieScoreSpanRef} className="score">
            {currentScores.tie}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <span
          className={clsx(
            "text-xs py-[0.5px] px-2 sm:py-1 sm:px-4 rounded-full border border-transparent player-name",
            !isPlayerTurn && "active"
          )}
        >
          {gameMode === "modeLive" && !opponent?.username
            ? "Waiting..."
            : opponent?.username}
        </span>
        <div className="score-box">
          <span ref={opponentScoreRef} className="score">
            {!opponent || !opponent?.id ? 0 : currentScores[opponent.id] ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
}
