export type SoundKeys =
  | "bg-music"
  | "game-over"
  | "new-game"
  | "player-move"
  | "opponent-move"
  | "won"
  | "error"
  | "click";

export type Theme =
  | "electricBlue"
  | "brightPink"
  | "neonGreen"
  | "solarYellow"
  | "vividPurple"
  | "fieryRed"
  | "tangerineOrange"
  | "lightsOff";

export type PlayerType = "creator" | "joined";

export type Player = {
  username: string;
  symbol: string;
  id: string;
  type: PlayerType;
};

export type GameMode = "modeLive" | "modeComputer";

export type GameSettings = {
  sound: boolean;
};

export type Scores = {
  [key: string]: number;
  tie: number;
};

export type GameSession = {
  board: BoardState;
  settings: GameSettings;
};

export type NewPlayer = {
  symbol: string;
  username: string;
};

export type Player = {
  username: string;
  symbol: string;
  type: PlayerType;
  id: string;
};

export type BoardState = {
  cells: Array<string | null>;
  player: Player;
  opponent?: Player;
  gameMode: GameMode;
  currentTurn: PlayerType;
  whoStarted: PlayerType;
  players: Player[];
  boardId: string;
  gameStatus: "waiting" | "playing";
  scores: Scores;
  boardName?: string;
};
