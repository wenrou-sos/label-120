import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback, ReactNode } from 'react';
import type { MatchData, MatchEvent, MatchStatus } from '../types/match';
import { generateInitialMatchData, generateIncrementalUpdate, generateGameEndData } from '../data/mockData';

interface MatchState {
  data: MatchData;
  replayEvent: MatchEvent | null;
  isReplayMode: boolean;
  lastEventId: string | null;
}

type MatchAction =
  | { type: 'UPDATE_DATA'; payload: Partial<MatchData> }
  | { type: 'SET_STATUS'; status: MatchStatus }
  | { type: 'START_REPLAY'; event: MatchEvent }
  | { type: 'EXIT_REPLAY' }
  | { type: 'MARK_EVENT_SEEN'; eventId: string }
  | { type: 'FINISH_GAME'; winner: 'blue' | 'red' };

interface MatchContextType extends MatchState {
  togglePause: () => void;
  startReplay: (event: MatchEvent) => void;
  exitReplay: () => void;
}

const MatchContext = createContext<MatchContextType | null>(null);

const matchReducer = (state: MatchState, action: MatchAction): MatchState => {
  switch (action.type) {
    case 'UPDATE_DATA':
      return {
        ...state,
        data: {
          ...state.data,
          ...action.payload,
          blueTeam: action.payload.blueTeam
            ? { ...state.data.blueTeam, ...action.payload.blueTeam }
            : state.data.blueTeam,
          redTeam: action.payload.redTeam
            ? { ...state.data.redTeam, ...action.payload.redTeam }
            : state.data.redTeam,
          players: action.payload.players ?? state.data.players,
          goldHistory: action.payload.goldHistory ?? state.data.goldHistory,
          events: action.payload.events ?? state.data.events,
        },
      };
    case 'SET_STATUS':
      return {
        ...state,
        data: { ...state.data, status: action.status },
      };
    case 'START_REPLAY':
      return {
        ...state,
        replayEvent: action.event,
        isReplayMode: true,
      };
    case 'EXIT_REPLAY':
      return {
        ...state,
        replayEvent: null,
        isReplayMode: false,
      };
    case 'MARK_EVENT_SEEN':
      return {
        ...state,
        lastEventId: action.eventId,
      };
    case 'FINISH_GAME':
      return {
        ...state,
        data: generateGameEndData(action.winner, state.data),
      };
    default:
      return state;
  }
};

export const MatchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initialData = useRef<MatchData>(generateInitialMatchData());
  const [state, dispatch] = useReducer(matchReducer, {
    data: initialData.current,
    replayEvent: null,
    isReplayMode: false,
    lastEventId: null,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      if (state.data.status === 'live' && !state.isReplayMode) {
        const updates = generateIncrementalUpdate(state.data);
        dispatch({ type: 'UPDATE_DATA', payload: updates });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [state.data, state.isReplayMode]);

  useEffect(() => {
    if (state.data.events.length > 0) {
      const lastEvent = state.data.events[state.data.events.length - 1];
      if (lastEvent.id !== state.lastEventId) {
        dispatch({ type: 'MARK_EVENT_SEEN', eventId: lastEvent.id });
      }
    }
  }, [state.data.events.length, state.lastEventId]);

  const togglePause = useCallback(() => {
    const newStatus: MatchStatus = state.data.status === 'live' ? 'paused' : 'live';
    dispatch({ type: 'SET_STATUS', status: newStatus });
  }, [state.data.status]);

  const startReplay = useCallback((event: MatchEvent) => {
    dispatch({ type: 'START_REPLAY', event });
  }, []);

  const exitReplay = useCallback(() => {
    dispatch({ type: 'EXIT_REPLAY' });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        dispatch({ type: 'FINISH_GAME', winner: state.data.blueTeam.totalGold >= state.data.redTeam.totalGold ? 'blue' : 'red' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    (window as any).__endMatch = () => {
      dispatch({ type: 'FINISH_GAME', winner: state.data.blueTeam.totalGold >= state.data.redTeam.totalGold ? 'blue' : 'red' });
    };
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      delete (window as any).__endMatch;
    };
  }, [state.data.blueTeam.totalGold, state.data.redTeam.totalGold]);

  return (
    <MatchContext.Provider
      value={{
        ...state,
        togglePause,
        startReplay,
        exitReplay,
      }}
    >
      {children}
    </MatchContext.Provider>
  );
};

export const useMatch = (): MatchContextType => {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error('useMatch must be used within a MatchProvider');
  }
  return context;
};
