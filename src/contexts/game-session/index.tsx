"use client";

import {
  createContext,
  useEffect,
  ReactNode,
  useReducer,
  Dispatch,
  useRef,
  useMemo,
  useState,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import _isEqual from "lodash.isequal";

import type { GameSession } from "../../../type";
import {
  DEFAULT_GAME_SESSION,
  GAME_SETTINGS,
  GAME_SCORES,
  extractBoarIdFromPathname,
} from "@/lib/game/utils";
import { Action, ActionTypes, gameSessionReducer } from "./reducer";
import { GameLoading } from "@/components/game/loading";
import {
  SOCKET_SESSION_ID,
  NEW_SOCKET_SESSION_ID,
  SESSION,
  CONNECT_ERROR,
} from "@/lib/socket/utils";
import { useSocket } from "@/hooks/useSocket";

export const GameSessionContext = createContext<{
  session: GameSession;
  dispatch: Dispatch<Action>;
}>({
  session: DEFAULT_GAME_SESSION,
  dispatch: () => {},
});

export function GameSessionProvider({ children }: { children: ReactNode }) {
  const [session, dispatch] = useReducer(
    gameSessionReducer,
    DEFAULT_GAME_SESSION
  );

  const pathname = usePathname();

  const currentBoardId = extractBoarIdFromPathname(pathname);

  const { socket } = useSocket();

  const [loading, setLoading] = useState(true);

  const initialRef = useRef({
    scores: session.board.scores,
    settings: session.settings,
  });

  const contextValue = useMemo(() => ({ session, dispatch }), [session]);

  const loadData = useCallback(() => {
    const savedScores = localStorage.getItem(GAME_SCORES);
    const savedSettings = localStorage.getItem(GAME_SETTINGS);
    let socketSessionID = localStorage.getItem(SOCKET_SESSION_ID);

    if (savedScores && session.board.gameMode === "modeComputer") {
      dispatch({
        type: ActionTypes.LOAD_SCORES,
        payload: JSON.parse(savedScores),
      });
    }

    if (savedSettings) {
      dispatch({
        type: ActionTypes.SAVE_SETTINGS,
        payload: JSON.parse(savedSettings),
      });
    }

    if (!socketSessionID) {
      socketSessionID = NEW_SOCKET_SESSION_ID;
    }

    socket.auth = { sessionID: socketSessionID, boardId: currentBoardId };
    socket.connect();

    setLoading(false);
  }, [session.board.gameMode, socket]);

  const saveData = useCallback(() => {
    const {
      board: { scores, gameMode },
      settings,
    } = session;

    if (gameMode !== "modeComputer") return;

    if (!_isEqual(initialRef.current.scores, scores)) {
      localStorage.setItem(GAME_SCORES, JSON.stringify(scores));
      initialRef.current.scores = scores;
    }

    if (!_isEqual(initialRef.current.settings, settings)) {
      localStorage.setItem(GAME_SETTINGS, JSON.stringify(settings));
      initialRef.current.settings = settings;
    }
  }, [session]);

  const initSocketSession = useCallback(() => {
    const sessionHandler = ({ sessionID }: { sessionID: string }) => {
      localStorage.setItem(SOCKET_SESSION_ID, sessionID);

      socket.sessionID = sessionID;
    };

    const connectErrorHandler = (err: any) => {
      if (socket.active) return;

      toast.error("Server connection failure!");
      console.info(err);
    };

    socket.on(SESSION, sessionHandler);

    socket.on(CONNECT_ERROR, connectErrorHandler);

    return () => {
      socket.off(SESSION, sessionHandler);
      socket.off(CONNECT_ERROR, connectErrorHandler);
    };
  }, [socket]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!loading) {
      saveData();
    }
  }, [loading, saveData]);

  useEffect(() => {
    initSocketSession();
  }, [initSocketSession]);

  if (loading) {
    return <GameLoading />;
  }

  return (
    <GameSessionContext.Provider value={contextValue}>
      {children}
    </GameSessionContext.Provider>
  );
}
