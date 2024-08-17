import type {
  GameSession,
  GameSettings,
  Scores,
  BoardState,
} from "../../../type";

export enum ActionTypes {
  UPDATE_BOARD_CELLS = "UPDATE_BOARD_CELLS",
  UPDATE_WHO_STARTED = "UPDATE_WHO_STARTED",
  SET_BOARD = "SET_BOARD",
  SAVE_SETTINGS = "SAVE_SETTINGS",
  UPDATE_SCORES = "UPDATE_SCORES",
  LOAD_SCORES = "LOAD_SCORES",
}

export type Action =
  | { type: ActionTypes.SET_BOARD; payload: BoardState }
  | { type: ActionTypes.UPDATE_BOARD_CELLS; payload: Array<string | null> }
  | { type: ActionTypes.UPDATE_WHO_STARTED; payload: BoardState["whoStarted"] }
  | { type: ActionTypes.SAVE_SETTINGS; payload: GameSettings }
  | {
      type: ActionTypes.UPDATE_SCORES;
      payload: Scores;
    }
  | { type: ActionTypes.LOAD_SCORES; payload: Scores };

export function gameSessionReducer(
  state: GameSession,
  action: Action
): GameSession {
  switch (action.type) {
    case ActionTypes.SET_BOARD:
      return { ...state, board: action.payload };

    case ActionTypes.UPDATE_BOARD_CELLS:
      return { ...state, board: { ...state.board, cells: action.payload } };

    case ActionTypes.UPDATE_WHO_STARTED:
      return {
        ...state,
        board: { ...state.board, whoStarted: action.payload },
      };

    case ActionTypes.UPDATE_SCORES:
      return {
        ...state,
        board: {
          ...state.board,
          scores: action.payload,
        },
      };

    case ActionTypes.SAVE_SETTINGS:
      return { ...state, settings: action.payload };

    case ActionTypes.LOAD_SCORES:
      return { ...state, board: { ...state.board, scores: action.payload } };

    default:
      return state;
  }
}
