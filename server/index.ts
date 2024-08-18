import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

import {
  CREATE_BOARD,
  DISCONNECT,
  JOIN_BOARD,
  PLAY,
  SESSION,
  VERIFY_BOARD,
  GAME_OVER,
  RESET_BOARD,
} from "../src/lib/socket/utils";
import { BoardMap } from "./store";
import {
  connectionMiddlware,
  createBoardHandler,
  disconnectHandler,
  gameOverHandler,
  initOnConnection,
  joinBoardHandler,
  playHandler,
  resetBoardHandler,
  verifyBoardHandler,
} from "./handlers";

declare module "socket.io" {
  interface Socket {
    sessionID: string;
    boardId: string;
  }
}

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";

const app = next({ dev, hostname, port });

const handler = app.getRequestHandler();

const boardMap = new BoardMap();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.use(connectionMiddlware);

  io.on("connection", (socket) => {
    console.log("Socket connected ✔");

    const { sessionID, boardId } = socket;

    socket.join(sessionID);
    socket.emit(SESSION, { sessionID: sessionID });

    initOnConnection(sessionID, boardMap, boardId, socket);

    socket.on(CREATE_BOARD, createBoardHandler(sessionID, boardMap, socket));

    socket.on(JOIN_BOARD, joinBoardHandler(sessionID, boardMap, socket));

    socket.on(VERIFY_BOARD, verifyBoardHandler(boardMap));

    socket.on(PLAY, playHandler(boardMap, socket));

    socket.on(GAME_OVER, gameOverHandler(boardMap, io));

    socket.on(RESET_BOARD, resetBoardHandler(boardMap, socket));

    socket.on(DISCONNECT, disconnectHandler(sessionID, boardMap, socket));
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
