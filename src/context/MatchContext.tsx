import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback, ReactNode } from 'react';
import type { MatchData, MatchEvent, MatchStatus } from '../types/match';
import { generateInitialMatchData, generateIncrementalUpdate, generateGameEndData, generateNextBPStep, generateLiveDataFromBP } from '../data/mockData';

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
  | { type: 'FINISH_GAME'; winner: 'blue' | 'red' }
  | { type: 'BP_TICK' }
  | { type: 'BP_STEP'; championId?: string }
  | { type: 'BP_COMPLETE' };

interface MatchContextType extends MatchState {
  togglePause: () => void;
  startReplay: (event: MatchEvent) => void;
  exitReplay: () => void;
  advanceBPStep: (championId?: string) => void;
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
    case 'BP_TICK': {
      if (!state.data.banPick || state.data.banPick.isComplete) return state;
      const currentTimeLeft = state.data.banPick.timeLeft;
      if (currentTimeLeft <= 1) {
        const nextBP = generateNextBPStep(state.data.banPick);
        if (nextBP.isComplete) {
          const liveData = generateLiveDataFromBP(nextBP, state.data);
          return {
            ...state,
            data: {
              ...state.data,
              ...liveData,
              blueTeam: { ...state.data.blueTeam, ...liveData.blueTeam, score: state.data.blueTeam.score },
              redTeam: { ...state.data.redTeam, ...liveData.redTeam, score: state.data.redTeam.score },
              banPick: nextBP,
            },
          };
        }
        return {
          ...state,
          data: { ...state.data, banPick: nextBP },
        };
      }
      return {
        ...state,
        data: {
          ...state.data,
          banPick: { ...state.data.banPick, timeLeft: currentTimeLeft - 1 },
        },
      };
    }
    case 'BP_STEP': {
      if (!state.data.banPick || state.data.banPick.isComplete) return state;
      const nextBP = generateNextBPStep(state.data.banPick, action.championId);
      if (nextBP.isComplete) {
        const liveData = generateLiveDataFromBP(nextBP, state.data);
        return {
          ...state,
          data: {
            ...state.data,
            ...liveData,
            blueTeam: { ...state.data.blueTeam, ...liveData.blueTeam, score: state.data.blueTeam.score },
            redTeam: { ...state.data.redTeam, ...liveData.redTeam, score: state.data.redTeam.score },
            banPick: nextBP,
          },
        };
      }
      return {
        ...state,
        data: { ...state.data, banPick: nextBP },
      };
    }
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
      if (state.data.status === 'ban_pick' && state.data.banPick && !state.data.banPick.isComplete) {
        dispatch({ type: 'BP_TICK' });
      } else if (state.data.status === 'live' && !state.isReplayMode) {
        const updates = generateIncrementalUpdate(state.data);
        dispatch({ type: 'UPDATE_DATA', payload: updates });

        const nextGameTime = updates.gameTime ?? state.data.gameTime + 1;
        const nextBlueScore = (updates.blueTeam?.score ?? state.data.blueTeam.score);
        const nextRedScore = (updates.redTeam?.score ?? state.data.redTeam.score);
        const MAX_GAME_SECONDS = 1800;
        const MAX_SCORE = Math.ceil(state.data.totalGames / 2);

        if (
          nextGameTime >= MAX_GAME_SECONDS ||
          nextBlueScore >= MAX_SCORE ||
          nextRedScore >= MAX_SCORE
        ) {
          const winner =
            (updates.blueTeam?.totalGold ?? state.data.blueTeam.totalGold) >=
            (updates.redTeam?.totalGold ?? state.data.redTeam.totalGold)
              ? 'blue'
              : 'red';
          dispatch({ type: 'FINISH_GAME', winner });
        }
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
    if (state.data.status === 'finished') return;
    const newStatus: MatchStatus = state.data.status === 'live' ? 'paused' : 'live';
    dispatch({ type: 'SET_STATUS', status: newStatus });
  }, [state.data.status]);

  const startReplay = useCallback((event: MatchEvent) => {
    dispatch({ type: 'START_REPLAY', event });
  }, []);

  const exitReplay = useCallback(() => {
    dispatch({ type: 'EXIT_REPLAY' });
  }, []);

  const advanceBPStep = useCallback((championId?: string) => {
    dispatch({ type: 'BP_STEP', championId });
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
        advanceBPStep,
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
