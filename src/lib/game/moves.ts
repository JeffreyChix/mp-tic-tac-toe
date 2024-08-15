import { shuffleArray } from "@/lib/utils";

export function checkWin(board: Array<string | null>, symbol: string) {
  // check rows
  for (let i = 0; i < board.length; i += 3) {
    if (
      board[i] === symbol &&
      board[i + 1] === symbol &&
      board[i + 2] === symbol
    ) {
      return true;
    }
  }

  // check columns
  for (let i = 0; i < 3; i += 1) {
    if (
      board[i] === symbol &&
      board[i + 3] === symbol &&
      board[i + 6] === symbol
    ) {
      return true;
    }
  }

  // check diagonals
  if (board[0] === symbol && board[4] === symbol && board[8] === symbol) {
    return true;
  }

  if (board[2] === symbol && board[4] === symbol && board[6] === symbol) {
    return true;
  }

  return false;
}

function checkFork(board: Array<string | null>, symbol: string) {
  for (let i = 0; i < board.length; i += 1) {
    if (typeof board[i] !== "string") {
      const tempBoard = [...board];
      tempBoard[i] = symbol;

      let forks = 0;
      for (let j = 0; j < tempBoard.length; j += 1) {
        if (typeof tempBoard[j] !== "string") {
          tempBoard[j] = symbol;
          if (checkWin(tempBoard, symbol)) {
            forks += 1;
          }
          tempBoard[j] = null;
        }
      }
      tempBoard[i] = null;
      if (forks >= 2) {
        return i;
      }
    }
  }

  return false;
}

function checkBlock(board: Array<string | null>, playerSymbol: string) {
  for (let i = 0; i < board.length; i += 1) {
    if (typeof board[i] !== "string") {
      const tempBoard = [...board];
      tempBoard[i] = playerSymbol;
      if (checkWin(tempBoard, playerSymbol)) {
        return i;
      }
    }
  }
  return false;
}

function checkCornerAndSide(board: Array<string | null>) {
  const cornersAndSides = shuffleArray([0, 1, 4, 3, 5, 7, 2, 6, 8]);
  for (let i = 0; i < cornersAndSides.length; i += 1) {
    if (typeof board[cornersAndSides[i]] !== "string") {
      return cornersAndSides[i];
    }
  }
  return false;
}

export function makeMove(
  board: Array<string | null>,
  playerSymbol: string,
  opponentSymbol: string
) {
  // Check for a winning move for assistant
  for (let i = 0; i < board.length; i++) {
    if (typeof board[i] !== "string") {
      const tempBoard = [...board];
      tempBoard[i] = opponentSymbol;
      if (checkWin(tempBoard, opponentSymbol)) {
        return i;
      }
    }
  }

  // Check for a blocking move against player
  const blockMove = checkBlock(board, playerSymbol);
  if (blockMove !== false) {
    return blockMove;
  }

  // Check for a fork move for assistant
  const forkMoveForAssistant = checkFork(board, opponentSymbol);
  if (forkMoveForAssistant !== false) {
    return forkMoveForAssistant;
  }

  // Check for a blocking move against player
  // if (difficulty === "easy") {
  //   const blockMove = checkBlock(board, playerSymbol);
  //   if (blockMove !== false) {
  //     return blockMove;
  //   }
  // }

  // Check for a fork move for player
  const forkMoveForPlayer = checkFork(board, playerSymbol);
  if (forkMoveForPlayer !== false) {
    return forkMoveForPlayer;
  }

  // Check for a corner move
  const cornersAndSidesMove = checkCornerAndSide(board);
  if (cornersAndSidesMove !== false) {
    return cornersAndSidesMove;
  }

  // No moves left to make
  return false;
}

export function getWinningIndexes(board: Array<string | null>) {
  // check rows
  for (let i = 0; i < board.length; i += 3) {
    if (board[i] === board[i + 1] && board[i + 1] === board[i + 2]) {
      return [i, i + 1, i + 2];
    }
  }

  // check columns
  for (let i = 0; i < 3; i += 1) {
    if (board[i] === board[i + 3] && board[i + 3] === board[i + 6]) {
      return [i, i + 3, i + 6];
    }
  }

  // check diagonals
  if (board[0] === board[4] && board[4] === board[8]) {
    return [0, 4, 8];
  }

  if (board[2] === board[4] && board[4] === board[6]) {
    return [2, 4, 6];
  }

  return [];
}
