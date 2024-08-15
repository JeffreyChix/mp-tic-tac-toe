"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { makeMove, checkWin, getWinningIndexes } from "@/lib/game/moves";
import { DEFAULT_BOARD_STATE } from "@/lib/game/utils";
import { useSound } from "./useSound";
import { useGameSession } from "./useGameSession";
import { ActionTypes } from "@/contexts/game-session/reducer";
import { PlayerType, Scores } from "../../type";
import { useSocket } from "./useSocket";
import {
  BOARD_RESET,
  GAME_OVER,
  PLAY,
  PLAYED,
  RESET_BOARD,
  UPDATE_NEXT_TO_PLAY,
} from "@/lib/socket/utils";

export function usePlayLogic(boardId = "") {
  const { session, dispatch } = useGameSession();
  const { socket } = useSocket();
  const { playSound } = useSound();

  const { board, player, opponent, gameMode } = session;
  const playerSymbol = player.symbol;
  const opponentSymbol = opponent.symbol;

  const [isPlayerTurn, setIsPlayerTurn] = useState(player.type === "creator");
  const playerStartedRef = useRef(player.type === "creator");
  const [gameOver, setGameOver] = useState(false);

  const isWin = useCallback(
    () => checkWin(board, playerSymbol) || checkWin(board, opponentSymbol),
    [board, playerSymbol, opponentSymbol]
  );

  const isGameTie = useCallback(
    () => board.every((s) => typeof s === "string") && !isWin(),
    [board, isWin]
  );

  const isEmpty = useCallback(
    () => board.every((s) => typeof s !== "string"),
    [board]
  );

  const handleOpponentComputerMove = useCallback(() => {
    if (gameMode !== "modeComputer" || isPlayerTurn || isWin() || isGameTie())
      return;

    setTimeout(() => {
      const opponentMove = makeMove(board, playerSymbol, opponentSymbol);
      if (opponentMove !== false) {
        const updatedBoard = [...board];
        updatedBoard[opponentMove] = opponentSymbol;
        dispatch({ type: ActionTypes.UPDATE_BOARD, payload: updatedBoard });
        playSound("opponent-move");
        setIsPlayerTurn(true);
      }
    }, 200);
  }, [
    board,
    dispatch,
    gameMode,
    isGameTie,
    isPlayerTurn,
    isWin,
    opponentSymbol,
    playSound,
    playerSymbol,
  ]);

  const handleResetBoard = useCallback(() => {
    dispatch({ type: ActionTypes.UPDATE_BOARD, payload: DEFAULT_BOARD_STATE });
    setGameOver(false);
    playSound("new-game");
  }, [dispatch, playSound]);

  const handleOpponentComputerResetBoard = useCallback(() => {
    if (gameMode !== "modeComputer" || !gameOver || isPlayerTurn) return;
    setTimeout(() => {
      handleResetBoard();
    }, 1000);
  }, [gameMode, gameOver, handleResetBoard, isPlayerTurn]);

  const checkGameOver = useCallback(() => {
    if (gameOver) return;

    const hasPlayerWon = checkWin(board, playerSymbol);
    const hasOpponentWon = checkWin(board, opponentSymbol);

    if (hasPlayerWon || hasOpponentWon || isGameTie()) {
      const key: keyof Scores = hasPlayerWon
        ? "player"
        : hasOpponentWon
        ? "opponent"
        : "tie";

      if (isGameTie()) {
        playSound("game-over");
      }

      if (hasPlayerWon || hasOpponentWon) {
        playSound("won");
      }

      dispatch({
        type: ActionTypes.INC_SCORE,
        payload: key,
      });

      setGameOver(true);
    }
  }, [
    board,
    dispatch,
    gameOver,
    isGameTie,
    opponentSymbol,
    playSound,
    playerSymbol,
  ]);

  const togglePlayerTurn = useCallback(() => {
    if (gameOver) {
      const playerStarted = !playerStartedRef.current;
      setIsPlayerTurn(playerStarted);
      playerStartedRef.current = playerStarted;

      if (gameMode === "modeLive") {
        const nextToPlay: PlayerType = playerStarted ? "creator" : "joined";

        socket.emit(GAME_OVER, boardId, nextToPlay);
      }
    }
  }, [socket, gameOver, boardId, gameMode]);

  const handleCellClick = useCallback(
    (symbol: string | null, index: number) => {
      if (symbol || !isPlayerTurn || (isEmpty() && !isPlayerTurn)) {
        playSound("error");
        return;
      }

      playSound("player-move");

      const updatedBoard = [...board];
      updatedBoard[index] = playerSymbol;
      dispatch({ type: ActionTypes.UPDATE_BOARD, payload: updatedBoard });
      setIsPlayerTurn(false);

      if (gameMode !== "modeComputer") {
        const nextToPlay = player.type === "creator" ? "joined" : "creator";
        socket.emit(PLAY, boardId, nextToPlay, updatedBoard);
      }
    },
    [
      socket,
      board,
      dispatch,
      player.type,
      boardId,
      gameMode,
      isEmpty,
      isPlayerTurn,
      playSound,
      playerSymbol,
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
        if (getWinningIndexes(board).includes(index)) {
          className += " win";
        }
      }
      if (isGameTie()) {
        className += "board-tie";
      }
      return className;
    },
    [board, isWin, isGameTie]
  );

  const listenForEvents = useCallback(() => {
    const playedHandler = (
      nextToPlay: PlayerType,
      boardCells: Array<string | null>
    ) => {
      setIsPlayerTurn(player.type === nextToPlay);
      dispatch({ type: ActionTypes.UPDATE_BOARD, payload: boardCells });

      if (boardCells.some((cell) => typeof cell !== "string")) {
        playSound("opponent-move");
      }
    };

    const nextToPlayHandler = (nextToPlay: PlayerType) => {
      setIsPlayerTurn(player.type === nextToPlay);
    };

    const boardResetHandler = () => {
      handleResetBoard();
    };

    socket.on(PLAYED, playedHandler);

    socket.on(UPDATE_NEXT_TO_PLAY, nextToPlayHandler);

    socket.on(BOARD_RESET, boardResetHandler);

    return () => {
      socket.off(PLAYED, playedHandler);
      socket.off(UPDATE_NEXT_TO_PLAY, nextToPlayHandler);
      socket.off(BOARD_RESET, boardResetHandler);
    };
  }, [socket, player.type, playSound, dispatch, handleResetBoard]);

  useEffect(handleOpponentComputerMove, [handleOpponentComputerMove]);
  useEffect(checkGameOver, [checkGameOver]);
  useEffect(togglePlayerTurn, [togglePlayerTurn]);
  useEffect(handleOpponentComputerResetBoard, [
    handleOpponentComputerResetBoard,
  ]);
  useEffect(listenForEvents, [listenForEvents]);

  return {
    board,
    getCellClassName,
    handleCellClick,
    resetBoard,
    gameOver,
    session,
    dispatch,
  };
}
