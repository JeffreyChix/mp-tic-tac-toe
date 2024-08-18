import type { Socket, Server } from "socket.io";

import {
  PLAYED,
  PLAYER_JOINED,
  NEW_SOCKET_SESSION_ID,
  UPDATE_FOR_NEXT_ROUND,
  BOARD_RESET,
  PLAYER_DISCONNECTED,
  PLAYER_CONNECTED,
} from "../src/lib/socket/utils";
import {
  generateBoardId,
  generateRandomId,
  isBoardMember,
  updateBoardConnections,
} from "./utils";
import { BoardState, NewPlayer, Scores } from "../type";
import { boardGameOverCounts, BoardMap } from "./store";
import { DEFAULT_BOARD_CELLS } from "../src/lib/game/utils";

type Callback = (val: any) => void;

export const connectionMiddlware = (
  socket: Socket,
  next: (err?: any) => void
) => {
  let sessionID = socket.handshake.auth.sessionID;
  let boardId = socket.handshake.auth.boardId;

  if (!sessionID) {
    return next(new Error("Invalid auth!"));
  }

  if (sessionID === NEW_SOCKET_SESSION_ID) {
    sessionID = generateRandomId();
  }

  socket.sessionID = sessionID;
  socket.boardId = boardId ?? "";
  next();
};

export const initOnConnection = (
  sessionID: string,
  boardMap: BoardMap,
  boardId: string,
  socket: Socket
) => {
  const board = boardMap.getBoard(boardId);

  if (board?.gameStatus === "waiting" && isBoardMember(board, sessionID)) {
    updateBoardConnections(board, sessionID);

    if (board.connectedPlayers.length === 2) {
      board.gameStatus = "playing";
    }

    boardMap.set(boardId, board);
    socket.join(boardId);
    socket.to(boardId).emit(PLAYER_CONNECTED, board, sessionID);
  }
};

export const createBoardHandler =
  (sessionID: string, boardMap: BoardMap, socket: Socket) =>
  (data: NewPlayer, cb: Callback) => {
    const boardId = generateBoardId();

    const player: BoardState["player"] = {
      ...data,
      type: "creator",
      id: sessionID,
    };

    const board: BoardState = {
      boardId,
      currentTurn: "creator",
      whoStarted: "creator",
      player,
      connectedPlayers: [sessionID],
      gameStatus: "waiting",
      scores: {
        tie: 0,
        [sessionID]: 0,
      },
      cells: DEFAULT_BOARD_CELLS,
      gameMode: "modeLive",
    };

    boardMap.set(boardId, board);
    boardGameOverCounts[boardId] = 0;

    socket.join(boardId);
    socket.boardId = boardId;

    cb({ status: "OK", board });
  };

export const joinBoardHandler =
  (sessionID: string, boardMap: BoardMap, socket: Socket) =>
  (boardId: string, data: NewPlayer, cb: Callback) => {
    let board = boardMap.getBoard(boardId);

    if (board && !board.opponent) {
      const opponent: BoardState["opponent"] = {
        ...data,
        type: "joined",
        id: sessionID,
      };

      board = {
        ...board,
        opponent,
        connectedPlayers: [...board.connectedPlayers, sessionID],
        gameStatus: "playing",
        scores: {
          ...board.scores,
          [sessionID]: 0,
        },
      };

      socket.join(boardId);
      socket.boardId = boardId;
      boardMap.set(boardId, board);

      socket.to(boardId).emit(PLAYER_JOINED, board);
      cb({ status: "OK", board });
    } else {
      cb({ status: "ERROR", message: "Cannot join this board!" });
    }
  };

export const verifyBoardHandler =
  (boardMap: BoardMap) => (boardId: string, cb: Callback) => {
    const board = boardMap.getBoard(boardId);
    cb({ board });
  };

export const playHandler =
  (boardMap: BoardMap, socket: Socket) =>
  (boardId: string, boardCells: Array<string | null>, cb: Callback) => {
    const board = boardMap.getBoard(boardId);

    if (!board) {
      return cb?.({ status: "NOT_FOUND" });
    }

    const nextToPlay = board.currentTurn === "creator" ? "joined" : "creator";
    board["currentTurn"] = nextToPlay;
    board["cells"] = boardCells;
    boardMap.set(boardId, board);

    socket
      .to(boardId)
      .emit(PLAYED, { currentTurn: nextToPlay, cells: boardCells });

    cb?.({ status: "OK" });
  };

export const gameOverHandler =
  (boardMap: BoardMap, io: Server) => (boardId: string, scores: Scores) => {
    const board = boardMap.getBoard(boardId);
    boardGameOverCounts[boardId]++;

    if (board && boardGameOverCounts[boardId] === 2) {
      const nextToPlay = board.whoStarted === "creator" ? "joined" : "creator";

      board.whoStarted = nextToPlay;
      board.currentTurn = nextToPlay;

      board.scores = scores;
      boardMap.set(boardId, board);

      io.in(boardId).emit(UPDATE_FOR_NEXT_ROUND, {
        whoStarted: nextToPlay,
        currentTurn: nextToPlay,
        scores,
      });
      boardGameOverCounts[boardId] = 0;
    }
  };

export const resetBoardHandler =
  (boardMap: BoardMap, socket: Socket) => (boardId: string) => {
    const board = boardMap.getBoard(boardId);

    if (board) {
      board["cells"] = DEFAULT_BOARD_CELLS;
      boardMap.set(boardId, board);
      socket.to(boardId).emit(BOARD_RESET);
    }
  };

export const disconnectHandler =
  (sessionID: string, boardMap: BoardMap, socket: Socket) => () => {
    const board = boardMap.getBoard(socket.boardId);

    if (board && board.connectedPlayers.length !== 0) {
      const newBoardState: BoardState = {
        ...board,
        gameStatus: "waiting",
        connectedPlayers: board.connectedPlayers.filter(
          (id) => id !== sessionID
        ),
      };

      boardMap.set(socket.boardId, newBoardState);

      socket
        .to(socket.boardId)
        .emit(PLAYER_DISCONNECTED, newBoardState, sessionID);
    }

    console.log("Left board::=> ", socket.boardId);
    socket.leave(socket.boardId);
  };
