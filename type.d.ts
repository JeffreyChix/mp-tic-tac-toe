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
  player: number;
  opponent: number;
  tie: number;
};

export type GameScores = Record<GameMode, Scores>;

export type GameSession = {
  board: Array<string | null>;
  player: Player;
  opponent: Player;
  scores: GameScores;
  settings: GameSettings;
  gameMode: GameMode;
};

export type PlayerMove = {
  index: number;
  boardState: Array<string | null>;
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
  player: Player;
  opponent?: Player;
  currentTurn: PlayerType;
  boardId: string;
  gameStatus: "waiting" | "playing";
  scores: Scores;
  numPlayers: number;
};
