"use client";

import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { toast } from "sonner";

import {
  getPosition,
  getSessionPlayerName,
  organizeBoardForSession,
} from "@/lib/game/utils";
import { usePlayLogic } from "@/hooks/usePlayLogic";
import { useSocket } from "@/hooks/useSocket";
import { useGameSession } from "@/hooks/useGameSession";
import {
  PLAYER_CONNECTED,
  PLAYER_DISCONNECTED,
  PLAYER_JOINED,
  VERIFY_BOARD,
} from "@/lib/socket/utils";
import { ActionTypes } from "@/contexts/game-session/reducer";
import { Cell } from "./cell";
import { Nav } from "./nav";
import { AwaitingOpponent } from "./awaiting-opponent";
import { GameLoading } from "./loading";
import { RogueBoard } from "./rogue-board";
import type { BoardState } from "../../../type";

import styles from "@/app/board.module.scss";

export const Board = ({ id }: { id?: string }) => {
  const [isGameLoading, setIsGameLoading] = useState(() => !!id);
  const [isRogue, setIsRogue] = useState(false);
  const [isAwaitingOpponent, setIsAwaitingOpponent] = useState(false);

  const { session, dispatch } = useGameSession();
  const { socket } = useSocket();

  const verifyBoardWithId = useCallback(() => {
    if (!id) return;

    const verifyBoardHandler = (res: { board: BoardState }) => {
      if (res.board) {
        dispatch({
          type: ActionTypes.SET_BOARD,
          payload: organizeBoardForSession(socket.sessionID, res.board),
        });
      } else {
        setIsRogue(true);
      }

      setIsGameLoading(false);
    };

    socket.emit(VERIFY_BOARD, id, verifyBoardHandler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAwaitingOpponent = useCallback(() => {
    if (!id) return;

    const isWaiting = session.board.connectedPlayers.length !== 2;
    console.log(session.board.connectedPlayers, isWaiting)
    setIsAwaitingOpponent(isWaiting);
  }, [id, session.board.connectedPlayers]);

  const listenForEvents = useCallback(() => {
    if (!id) return;

    const playerJoinedHandler = (board: BoardState) => {
      dispatch({
        type: ActionTypes.SET_BOARD,
        payload: organizeBoardForSession(socket.sessionID, board),
      });
    };

    const playerConnectedHandler = (
      board: BoardState,
      connectedPlayerId: string
    ) => {
      const playerName = getSessionPlayerName(connectedPlayerId, board);
      toast.info(`${playerName} connected!`);

      dispatch({
        type: ActionTypes.SET_BOARD,
        payload: organizeBoardForSession(socket.sessionID, board),
      });
    };

    const playerDisconnectedHandler = (
      board: BoardState,
      disconnectedPlayerId: string
    ) => {
      const playerName = getSessionPlayerName(disconnectedPlayerId, board);
      toast.info(`${playerName} disconnected!`);

      dispatch({
        type: ActionTypes.SET_BOARD,
        payload: organizeBoardForSession(socket.sessionID, board),
      });
    };

    socket.on(PLAYER_JOINED, playerJoinedHandler);
    socket.on(PLAYER_CONNECTED, playerConnectedHandler);
    socket.on(PLAYER_DISCONNECTED, playerDisconnectedHandler);

    return () => {
      socket.off(PLAYER_JOINED, playerJoinedHandler);
      socket.off(PLAYER_CONNECTED, playerConnectedHandler);
      socket.off(PLAYER_DISCONNECTED, playerDisconnectedHandler);
    };
  }, [id, dispatch, socket]);

  useEffect(() => {
    verifyBoardWithId();
  }, [verifyBoardWithId]);

  useEffect(() => {
    handleAwaitingOpponent();
  }, [handleAwaitingOpponent]);

  useEffect(() => {
    listenForEvents();
  }, [listenForEvents]);

  const {
    getCellClassName,
    isPlayerTurn,
    handleCellClick,
    resetBoard,
    isGameOver,
  } = usePlayLogic(id);

  if (isGameLoading) return <GameLoading />;
  if (isRogue) return <RogueBoard />;

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

      <AwaitingOpponent isAwaiting={isAwaitingOpponent} boardId={id} />
    </>
  );
};
