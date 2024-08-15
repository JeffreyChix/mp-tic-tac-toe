import { createServer } from "node:http";
import next from "next";
import crypto from "crypto";
import { Server } from "socket.io";
import type { Socket } from "socket.io";
import {
  BOARD_CLOSED,
  BOARD_CREATED,
  BOARD_INFO,
  CLOSE_BOARD,
  CREATE_BOARD,
  DISCONNECT,
  ERROR,
  JOIN_BOARD,
  JOINED_BOARD,
  PLAY,
  PLAYED,
  PLAYER_JOINED,
  SCORES_UPDATED,
  SESSION,
  UPDATE_SCORES,
  NEW_SOCKET_SESSION_ID,
  VERIFY_BOARD,
  GAME_OVER,
  UPDATE_NEXT_TO_PLAY,
  RESET_BOARD,
  BOARD_RESET,
} from "../src/lib/socket/utils";
import { generateBoardId } from "../src/lib/utils";
import { DEFAULT_SCORE } from "../src/lib/game/utils";
import { Board } from "./boards";
import { NewPlayer, BoardState, PlayerType } from "../type";

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

const boards = new Board();

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

    const socketId = socket.id;
    const sessionID = socket.sessionID;

    socket.join(sessionID);

    socket.emit(SESSION, { sessionID });

    socket.on(CREATE_BOARD, (data: NewPlayer, cb) => {
      const boardId = generateBoardId();
      const player: BoardState["player"] = {
        ...data,
        type: "creator",
        id: socketId,
      };

      const board: BoardState = {
        boardId,
        currentTurn: "creator",
        player,
        gameStatus: "waiting",
        scores: DEFAULT_SCORE,
        numPlayers: 1,
      };

      boards.set(boardId, board);
      socket.join(boardId);

      io.in(sessionID).emit(BOARD_CREATED, { boardId });
      cb?.({ status: "OK" });
    });

    socket.on(JOIN_BOARD, (boardId: string, data: NewPlayer, cb) => {
      let board = boards.getBoard(boardId);

      if (board && board.numPlayers === 1) {
        const opponent: BoardState["opponent"] = {
          ...data,
          type: "joined",
          id: socketId,
        };

        board = {
          ...board,
          opponent,
          numPlayers: 2,
          gameStatus: "playing",
        };

        socket.join(boardId);
        boards.set(boardId, board);

        socket.to(boardId).emit(PLAYER_JOINED, opponent);
        io.in(sessionID).emit(JOINED_BOARD, board.player);
        cb?.({ status: "OK" });
      } else {
        io.in(socketId).emit(ERROR, { message: "Cannot join this board!" });
      }
    });

    socket.on(VERIFY_BOARD, (boardId: string, cb) => {
      const board = boards.getBoard(boardId);
      cb({
        exists: !!board,
        playerUsername: board?.player?.username,
        playerSymbol: board?.player?.symbol,
      });
    });

    socket.on(
      PLAY,
      (
        boardId: string,
        nextToPlay: PlayerType,
        boardCells: Array<string | null>,
        cb
      ) => {
        const board = boards.getBoard(boardId);
        if (board) {
          socket.to(boardId).emit(PLAYED, nextToPlay, boardCells);
          cb?.({ status: "OK" });
        } else {
          cb?.({ status: "NOT_FOUND" });
        }
      }
    );

    socket.on(GAME_OVER, (boardId: string, nextToPlay: PlayerType) => {
      io.in(boardId).emit(UPDATE_NEXT_TO_PLAY, nextToPlay);
    });

    socket.on(RESET_BOARD, (boardId: string) => {
      socket.to(boardId).emit(BOARD_RESET);
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
