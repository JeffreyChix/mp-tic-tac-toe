"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";

import { getPosition } from "@/lib/game/utils";
import { usePlayLogic } from "@/hooks/usePlayLogic";
import { useSocket } from "@/hooks/useSocket";
import { useGameSession } from "@/hooks/useGameSession";
import { PLAYER_JOINED, VERIFY_BOARD } from "@/lib/socket/utils";
import { ActionTypes } from "@/contexts/game-session/reducer";

import { Cell } from "./cell";
import { Nav } from "./nav";
import { AwaitingOpponent } from "./awaiting-opponent";
import { GameLoading } from "./loading";
import { RogueBoard } from "./rogue-board";

import type { BoardState, Player } from "../../../type";
import styles from "@/app/board.module.scss";

export const Board = ({ id }: { id?: string }) => {
  // const [isGameLoading, setIsGameLoading] = useState(() => !!id);
  // const [isRogue, setIsRogue] = useState(false);
  const [isAwaitingOpponent, setIsAwaitingOpponent] = useState(false);

  const { session, dispatch } = useGameSession();
  const { socket } = useSocket();
  const searchParams = useSearchParams();

  // const verifyBoardWithId = useCallback(() => {
  //   if (!id) return;

  //   socket.emit(VERIFY_BOARD, id, (res: { board: BoardState }) => {
  //     if (res.board) {
  //       const { player, opponent } = res.board;
  //       const isPlayer = player.id === socket.sessionID;

  //       dispatch({
  //         type: ActionTypes.SET_BOARD,
  //         payload: {
  //           ...res.board,
  //           player: (isPlayer ? player : opponent) as Player,
  //           opponent: isPlayer ? opponent : player,
  //         },
  //       });
  //     } else {
  //       setIsRogue(true);
  //     }

  //     setIsGameLoading(false);
  //   });
  // }, [id, socket, dispatch]);

  const handleWaitingForPlayer2 = useCallback(() => {
    if (!id) return;

    const isWaiting = !(session.board.player && session.board.opponent);
    setIsAwaitingOpponent(isWaiting);
  }, [id, session.board.player, session.board.opponent]);

  // useEffect(() => {
  //   verifyBoardWithId();
  // }, [verifyBoardWithId]);

  useEffect(() => {
    if (!id) return;
    const playerJoinedHandler = (board: BoardState) => {
      dispatch({ type: ActionTypes.SET_BOARD, payload: board });
    };
    socket.on(PLAYER_JOINED, playerJoinedHandler);

    return () => {
      socket.off(PLAYER_JOINED, playerJoinedHandler);
    };
  }, [id, dispatch, socket]);

  useEffect(() => {
    handleWaitingForPlayer2();
  }, [handleWaitingForPlayer2]);

  const {
    getCellClassName,
    isPlayerTurn,
    handleCellClick,
    resetBoard,
    isGameOver,
  } = usePlayLogic(id);

  const name = searchParams.get("name");

  // if (isGameLoading) return <GameLoading />;
  // if (isRogue) return <RogueBoard />;

  return (
    <>
      <section className={styles.wrapper}>
        <section className={styles.board_section}>
          <div className={styles.board}>
            {session.board.cells.map((cell: string | null, index: number) => (
              <Cell
                key={`cell-${index}`}
                position={getPosition(index)}
                symbol={cell}
                className={getCellClassName(index)}
                onClick={() => handleCellClick(cell, index)}
              />
            ))}
          </div>
          <div
            className={clsx(styles.restart, isGameOver() && styles.show)}
            onClick={resetBoard}
          />
        </section>
        <Nav data={{ isPlayerTurn, boardId: id }} />
      </section>

      <AwaitingOpponent
        isAwaiting={isAwaitingOpponent}
        name={name}
        boardId={id}
      />
    </>
  );
};
