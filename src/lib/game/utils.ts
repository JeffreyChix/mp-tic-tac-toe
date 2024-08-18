import type { GameSession, Theme, BoardState, Player } from "../../../type";

export function getPosition(index: number) {
  switch (index) {
    case 0:
      return "top left";
    case 1:
      return "top";
    case 2:
      return "top right";
    case 3:
      return "left";
    case 5:
      return "right";
    case 6:
      return "bottom left";
    case 7:
      return "bottom";
    case 8:
      return "bottom right";
    default:
      return "";
  }
}

export const DEFAULT_BOARD_CELLS = Array.from({ length: 9 }, () => null);

export const GAME_SCORES = "GAME_SCORES";

export const GAME_SETTINGS = "GAME_SETTINGS";

export const THEMES: Theme[] = [
  "electricBlue",
  "brightPink",
  "fieryRed",
  "neonGreen",
  "solarYellow",
  "tangerineOrange",
  "vividPurple",
  "lightsOff",
];

export const THEMES_WITH_DISPLAY_NAMES: Array<{ name: string; value: Theme }> =
  [
    {
      name: "Electric Blue",
      value: "electricBlue",
    },
    {
      name: "Bright Pink",
      value: "brightPink",
    },
    {
      name: "Fiery Red",
      value: "fieryRed",
    },
    {
      name: "Neon Green",
      value: "neonGreen",
    },
    {
      name: "Solar Yellow",
      value: "solarYellow",
    },
    {
      name: "Tangerine Orange",
      value: "tangerineOrange",
    },
    {
      name: "Vivid Purple",
      value: "vividPurple",
    },
    {
      name: "Lights Off",
      value: "lightsOff",
    },
  ];

export const DEFAULT_SCORE = {
  tie: 0,
};

const DEFAULT_PLAYER: Player = {
  username: "Player 1",
  symbol: "x",
  id: "__device_player",
  type: "creator",
};

const DEFAULT_OPPONENT: Player = {
  username: "Computer",
  symbol: "o",
  id: "__computer__",
  type: "joined",
};

export const DEFAULT_BOARD_STATE: BoardState = {
  cells: DEFAULT_BOARD_CELLS,
  gameMode: "modeComputer",
  player: DEFAULT_PLAYER,
  opponent: DEFAULT_OPPONENT,
  scores: DEFAULT_SCORE,
  boardId: "__local__",
  whoStarted: "creator",
  currentTurn: "creator",
  gameStatus: "playing",
  connectedPlayers: ["__device_player", "__computer__"],
};

export const DEFAULT_GAME_SESSION: GameSession = {
  board: DEFAULT_BOARD_STATE,
  settings: {
    sound: true,
  },
};

export function organizeBoardForSession(
  sessionID: string,
  boardState: BoardState
): BoardState {
  const { player, opponent } = boardState;
  const isSessionPlayer = player.id === sessionID;

  return {
    ...boardState,
    player: isSessionPlayer ? player : (opponent as Player),
    opponent: isSessionPlayer ? opponent : player,
  };
}

export function getSessionPlayerName(id: string, boardState: BoardState) {
  const { player, opponent } = boardState;

  const sessionPlayer = id === player.id ? player : opponent;

  return sessionPlayer?.username;
}

export function extractBoarIdFromPathname(pathname: string): string | null {
  const boardPathnamePrefix = "/board/";

  if (pathname.startsWith(boardPathnamePrefix)) {
    const parts = pathname.slice(boardPathnamePrefix.length).split("/");

    if (parts.length > 0) {
      return parts[0];
    }
  }

  return "";
}
