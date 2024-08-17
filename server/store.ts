import { BoardState } from "../type";

export class BoardMap {
  boards: Map<string, BoardState>;

  constructor() {
    this.boards = new Map();
  }

  set(id: string, board: BoardState) {
    this.boards.set(id, board);
  }

  getBoard(id: string) {
    return this.boards.get(id);
  }

  has(id: string) {
    return this.boards.has(id);
  }
}
export class SessionBoardMap {
  private sessionBoards: Map<string, string[]>;

  constructor() {
    this.sessionBoards = new Map();
  }

  get(sessionID: string) {
    return this.sessionBoards.get(sessionID);
  }

  set(sessionID: string, boardIds: string[]) {
    this.sessionBoards.set(sessionID, boardIds);
  }

  has(sessionID: string) {
    return this.sessionBoards.has(sessionID);
  }
}

export const boardGameOverCounts: Record<string, number> = {};
