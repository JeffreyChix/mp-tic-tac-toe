import { createServer } from "node:http";
import next from "next";
import crypto from "crypto";
import { Server } from "socket.io";

import {
  BOARD_CLOSED,
  BOARD_CREATED,
  BOARD_INFO,
  CLOSE_BOARD,
  CREATE_BOARD,
  DISCONNECT,
  ERROR,
  JOIN_BOARD,
  PLAY,
  PLAYED,
  PLAYER_JOINED,
  SCORES_UPDATED,
  SESSION,
  UPDATE_SCORES,
  NEW_SOCKET_SESSION_ID,
  VERIFY_BOARD,
  GAME_OVER,
  UPDATE_FOR_NEXT_ROUND,
  RESET_BOARD,
  BOARD_RESET,
} from "../src/lib/socket/utils";
import { generateBoardId } from "../src/lib/utils";
import { DEFAULT_BOARD_CELLS, DEFAULT_SCORE } from "../src/lib/game/utils";
import { BoardMap, SessionBoardMap, boardGameOverCounts } from "./store";
import { NewPlayer, BoardState, Scores } from "../type";

declare module "socket.io" {
  interface Socket {
    sessionID: string;
  }
}

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";

const app = next({ dev, hostname, port });

const handler = app.getRequestHandler();

const randomId = () => crypto.randomBytes(8).toString("hex");

const boardMap = new BoardMap();
const sessionBoardMap = new SessionBoardMap();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.use((socket, next) => {
    let sessionID = socket.handshake.auth.sessionID;

    if (!sessionID) {
      return next(new Error("Invalid session ID!"));
    }

    if (sessionID === NEW_SOCKET_SESSION_ID) {
      sessionID = randomId();
    }

    socket.sessionID = sessionID;
    next();
  });

  io.on("connection", (socket) => {
    console.log("Socket connected ✔");

    socket.join(socket.sessionID);

    socket.emit(SESSION, { sessionID: socket.sessionID });

    const connectedBoardIds = sessionBoardMap.get(socket.sessionID);
    connectedBoardIds?.forEach((boardId) => {
      socket.join(boardId);
    });

    socket.on(CREATE_BOARD, (data: NewPlayer, cb) => {
      const boardId = generateBoardId();
      const player: BoardState["player"] = {
        ...data,
        type: "creator",
        id: socket.sessionID,
      };

      const board: BoardState = {
        boardId,
        currentTurn: "creator",
        whoStarted: "creator",
        player,
        players: [player],
        gameStatus: "waiting",
        scores: {
          tie: 0,
          [socket.sessionID]: 0,
        },
        cells: DEFAULT_BOARD_CELLS,
        gameMode: "modeLive",
      };

      boardMap.set(boardId, board);
      boardGameOverCounts[boardId] = 0;

      socket.join(boardId);

      const connectedBoardIds = sessionBoardMap.get(socket.sessionID) || [];
      connectedBoardIds.push(boardId);
      sessionBoardMap.set(socket.sessionID, connectedBoardIds);

      cb?.({ status: "OK", board });
    });

    socket.on(JOIN_BOARD, (boardId: string, data: NewPlayer, cb) => {
      let board = boardMap.getBoard(boardId);

      if (board && board.players.length < 2) {
        const opponent: BoardState["opponent"] = {
          ...data,
          type: "joined",
          id: socket.sessionID,
        };

        board = {
          ...board,
          opponent,
          players: [...board.players, opponent],
          gameStatus: "playing",
          scores: {
            ...board.scores,
            [socket.sessionID]: 0,
          },
        };

        socket.join(boardId);
        boardMap.set(boardId, board);

        const connectedBoardIds = sessionBoardMap.get(socket.sessionID) || [];
        connectedBoardIds.push(boardId);
        sessionBoardMap.set(socket.sessionID, connectedBoardIds);

        socket.to(boardId).emit(PLAYER_JOINED, board);
        cb?.({ status: "OK", board });
      } else {
        io.in(socket.sessionID).emit(ERROR, {
          message: "Cannot join this board!",
        });
      }
    });

    socket.on(VERIFY_BOARD, (boardId: string, cb) => {
      const board = boardMap.getBoard(boardId);
      cb({ board });
    });

    socket.on(PLAY, (boardId: string, boardCells: Array<string | null>, cb) => {
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
    });

    socket.on(GAME_OVER, (boardId: string, scores: Scores) => {
      const board = boardMap.getBoard(boardId);
      boardGameOverCounts[boardId]++;

      if (board && boardGameOverCounts[boardId] === 2) {
        const nextToPlay =
          board.whoStarted === "creator" ? "joined" : "creator";

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
    });

    socket.on(RESET_BOARD, (boardId: string) => {
      const board = boardMap.getBoard(boardId);

      if (board) {
        board["cells"] = DEFAULT_BOARD_CELLS;
        boardMap.set(boardId, board);
        socket.to(boardId).emit(BOARD_RESET);
      }
    });

    socket.on(DISCONNECT, () => {
      const connectedBoardIds = sessionBoardMap.get(socket.sessionID);
      connectedBoardIds?.forEach((boardId) => {
        console.log("Left board ", boardId);
        socket.leave(boardId);
      });
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
