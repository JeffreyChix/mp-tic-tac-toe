"use client";

import { useEffect, useCallback, useMemo } from "react";
import { makeMove, checkWin, getWinningIndexes } from "@/lib/game/moves";
import { DEFAULT_BOARD_CELLS } from "@/lib/game/utils";
import { useSound } from "./useSound";
import { useGameSession } from "./useGameSession";
import { ActionTypes } from "@/contexts/game-session/reducer";
import { useSocket } from "./useSocket";
import {
  BOARD_RESET,
  GAME_OVER,
  PLAY,
  PLAYED,
  RESET_BOARD,
  UPDATE_FOR_NEXT_ROUND,
} from "@/lib/socket/utils";
import { BoardState, Player } from "../../type";

export function usePlayLogic(boardId = "") {
  const { session, dispatch } = useGameSession();
  const { socket } = useSocket();
  const { playSound } = useSound();

  const {
    cells: boardCells,
    player,
    opponent,
    gameMode,
    whoStarted,
    currentTurn,
    scores,
    gameStatus,
  } = session.board;

  const playerSymbol = player.symbol;
  const opponentSymbol = opponent?.symbol as string;

  const isPlayerTurn = useMemo(
    () => player.type === currentTurn,
    [currentTurn, player.type]
  );

  const isWin = useCallback(
    () =>
      checkWin(boardCells, playerSymbol) ||
      checkWin(boardCells, opponentSymbol),
    [boardCells, playerSymbol, opponentSymbol]
  );

  const isGameTie = useCallback(
    () => boardCells.every((s) => typeof s === "string") && !isWin(),
    [boardCells, isWin]
  );

  const isEmpty = useCallback(
    () => boardCells.every((s) => typeof s !== "string"),
    [boardCells]
  );

  const isGameOver = useCallback(
    () => isWin() || isGameTie(),
    [isGameTie, isWin]
  );

  const handleOpponentComputerMove = useCallback(() => {
    if (gameMode !== "modeComputer" || isPlayerTurn || isWin() || isGameTie())
      return;

    setTimeout(() => {
      const opponentMove = makeMove(boardCells, playerSymbol, opponentSymbol);
      if (opponentMove !== false) {
        const updatedBoard = [...boardCells];
        updatedBoard[opponentMove] = opponentSymbol;

        dispatch({
          type: ActionTypes.SET_BOARD,
          payload: {
            ...session.board,
            cells: updatedBoard,
            currentTurn: currentTurn === "creator" ? "joined" : "creator",
          },
        });

        playSound("opponent-move");
      }
    }, 200);
  }, [
    boardCells,
    currentTurn,
    dispatch,
    gameMode,
    isGameTie,
    isPlayerTurn,
    isWin,
    opponentSymbol,
    playSound,
    playerSymbol,
    session.board,
  ]);

  const handleResetBoard = useCallback(() => {
    dispatch({
      type: ActionTypes.UPDATE_BOARD_CELLS,
      payload: DEFAULT_BOARD_CELLS,
    });
    playSound("new-game");
  }, [dispatch, playSound]);

  const handleOpponentComputerResetBoard = useCallback(() => {
    if (gameMode !== "modeComputer" || isPlayerTurn || !isGameOver()) return;
    setTimeout(handleResetBoard, isWin() ? 3000 : 1000);
  }, [gameMode, handleResetBoard, isWin, isPlayerTurn, isGameOver]);

  const handleOnGameOver = useCallback(() => {
    if (!isGameOver()) return;

    const hasPlayerWon = checkWin(boardCells, playerSymbol);
    const hasOpponentWon = checkWin(boardCells, opponentSymbol);

    const key = hasPlayerWon
      ? player.id
      : hasOpponentWon
      ? (opponent as Player).id
      : "tie";

    playSound(key === "tie" ? "game-over" : "won");

    let keyScore = scores[key] || 0;
    const newScores = { ...scores, [key]: keyScore + 1 };

    if (gameMode === "modeComputer") {
      const nextToPlay = whoStarted === "creator" ? "joined" : "creator";

      dispatch({
        type: ActionTypes.SET_BOARD,
        payload: {
          ...session.board,
          scores: newScores,
          currentTurn: nextToPlay,
          whoStarted: nextToPlay,
        },
      });
    } else {
      socket.emit(GAME_OVER, boardId, newScores);
    }

    //! This should run ONLY on game over
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameOver]);

  const handleCellClick = useCallback(
    (symbol: string | null, index: number) => {
      if (
        gameStatus !== "playing" ||
        symbol ||
        !isPlayerTurn ||
        (isEmpty() && !isPlayerTurn)
      ) {
        playSound("error");
        return;
      }

      playSound("player-move");

      const updatedBoardCells = [...boardCells];
      updatedBoardCells[index] = playerSymbol;

      dispatch({
        type: ActionTypes.SET_BOARD,
        payload: {
          ...session.board,
          cells: updatedBoardCells,
          currentTurn: currentTurn === "creator" ? "joined" : "creator",
        },
      });

      if (gameMode === "modeLive") {
        socket.emit(PLAY, boardId, updatedBoardCells);
      }
    },
    [
      boardCells,
      boardId,
      currentTurn,
      dispatch,
      gameMode,
      gameStatus,
      isEmpty,
      isPlayerTurn,
      playSound,
      playerSymbol,
      session.board,
      socket,
    ]
  );

  const resetBoard = useCallback(() => {
    if (!isPlayerTurn) return;

    handleResetBoard();

    if (gameMode === "modeLive") {
      socket.emit(RESET_BOARD, boardId);
    }
  }, [isPlayerTurn, handleResetBoard, gameMode, socket, boardId]);

  const getCellClassName = useCallback(
    (index: number) => {
      let className = "";
      if (isWin()) {
        className += "board-win";
        if (getWinningIndexes(boardCells).includes(index)) {
          className += " win";
        }
      }
      if (isGameTie()) {
        className += "board-tie";
      }
      return className;
    },
    [boardCells, isWin, isGameTie]
  );

  const listenForEvents = useCallback(() => {
    if (gameMode !== "modeLive") return;

    const playedHandler = ({
      cells,
      currentTurn,
    }: Pick<BoardState, "cells" | "currentTurn">) => {
      dispatch({
        type: ActionTypes.SET_BOARD,
        payload: { ...session.board, cells, currentTurn },
      });

      if (cells.some((cell) => typeof cell !== "string")) {
        playSound("opponent-move");
      }
    };

    const updateForNextRoundHandler = ({
      whoStarted,
      currentTurn,
      scores,
    }: Pick<BoardState, "whoStarted" | "currentTurn" | "scores">) => {
      dispatch({
        type: ActionTypes.SET_BOARD,
        payload: {
          ...session.board,
          whoStarted,
          currentTurn,
          scores,
        },
      });
    };

    const boardResetHandler = () => {
      handleResetBoard();
    };

    socket.on(PLAYED, playedHandler);
    socket.on(UPDATE_FOR_NEXT_ROUND, updateForNextRoundHandler);
    socket.on(BOARD_RESET, boardResetHandler);

    return () => {
      socket.off(PLAYED, playedHandler);
      socket.off(UPDATE_FOR_NEXT_ROUND, updateForNextRoundHandler);
      socket.off(BOARD_RESET, boardResetHandler);
    };
  }, [dispatch, gameMode, handleResetBoard, playSound, session.board, socket]);

  useEffect(() => {
    handleOpponentComputerMove();
  }, [handleOpponentComputerMove]);

  useEffect(() => {
    handleOnGameOver();
  }, [handleOnGameOver]);

  useEffect(() => {
    handleOpponentComputerResetBoard();
  }, [handleOpponentComputerResetBoard]);

  useEffect(() => {
    listenForEvents();
  }, [listenForEvents]);

  return {
    getCellClassName,
    handleCellClick,
    resetBoard,
    isPlayerTurn,
    isGameOver,
    dispatch,
  };
}
