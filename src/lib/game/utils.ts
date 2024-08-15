import type { GameSession, Scores, GameScores, Theme } from "../../../type";

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

export const DEFAULT_BOARD_STATE = Array.from({ length: 9 }, () => null);

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
  player: 0,
  opponent: 0,
  tie: 0,
};

export const DEFAULT_GAME_SCORES = {
  modeComputer: DEFAULT_SCORE,
  modeLive: DEFAULT_SCORE,
};

export const DEFAULT_GAME_SESSION: GameSession = {
  board: DEFAULT_BOARD_STATE,
  gameMode: "modeComputer",
  player: { username: "Player 1", symbol: "x", id: "creator", type: "creator" },
  opponent: {
    username: "Computer",
    symbol: "o",
    id: "opponent",
    type: "joined",
  },
  scores: DEFAULT_GAME_SCORES,
  settings: {
    sound: true,
  },
};
