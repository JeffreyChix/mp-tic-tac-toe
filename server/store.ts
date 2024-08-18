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

export const boardGameOverCounts: Record<string, number> = {};
