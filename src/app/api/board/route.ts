import { NextRequest, NextResponse } from "next/server";
import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";

type NextApiResponseWithSocket = NextResponse & {
  socket: {
    server: HttpServer & {
      io?: SocketServer;
    };
  };
};

export async function GET(req: NextRequest, res: NextApiResponseWithSocket) {

}
