import type {
  GameSession,
  Player,
  GameSettings,
  Scores,
  PlayerType,
  GameScores,
} from "../../../type";
import { DEFAULT_SCORE } from "@/lib/game/utils";

export enum ActionTypes {
  UPDATE_BOARD = "UPDATE_BOARD",
  SAVE_SETTINGS = "SAVE_SETTINGS",
  INC_SCORE = "INC_SCORE",
  LOAD_SCORES = "LOAD_SCORES",
  INIT_PLAYER = "INIT_PLAYER",
}

export type Action =
  | {
      type: ActionTypes.INIT_PLAYER;
      payload: {
        key: "player" | "opponent";
        player: Player;
      };
    }
  | { type: ActionTypes.UPDATE_BOARD; payload: Array<string | null> }
  | {
      type: ActionTypes.SAVE_SETTINGS;
      payload: GameSettings;
    }
  | {
      type: ActionTypes.INC_SCORE;
      payload: keyof Scores;
    }
  | { type: ActionTypes.LOAD_SCORES; payload: GameScores };

export function gameSessionReducer(
  state: GameSession,
  action: Action
): GameSession {
  switch (action.type) {
    case ActionTypes.INIT_PLAYER:
      return {
        ...state,
        gameMode: "modeLive",
        [action.payload.key]: action.payload.player,
      };

    case ActionTypes.UPDATE_BOARD:
      return { ...state, board: action.payload };

    case ActionTypes.INC_SCORE: {
      const currentMode = state.gameMode;
      const payload = action.payload;
      const currentScores = state.scores[currentMode];

      const score = currentScores[payload] ?? 0;

      const newScores = {
        ...currentScores,
        [payload]: score + 1,
      };

      return {
        ...state,
        scores: {
          ...state.scores,
          [currentMode]: newScores,
        },
      };
    }

    case ActionTypes.SAVE_SETTINGS:
      return { ...state, settings: action.payload };

    case ActionTypes.LOAD_SCORES:
      return {
        ...state,
        scores: action.payload,
      };

    default:
      return state;
  }
}
