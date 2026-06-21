export type MatchStatus = 'ban_pick' | 'live' | 'paused' | 'finished';

export type BPActionType = 'ban' | 'pick';

export interface Champion {
  id: string;
  name: string;
  icon: string;
  recommendedRoles: PlayerRole[];
}

export interface BPSlot {
  id: string;
  team: 'blue' | 'red';
  action: BPActionType;
  phase: number;
  order: number;
  championId: string | null;
  completed: boolean;
}

export interface BanPickState {
  currentSlotIndex: number;
  slots: BPSlot[];
  blueBans: string[];
  redBans: string[];
  bluePicks: { championId: string; role: PlayerRole }[];
  redPicks: { championId: string; role: PlayerRole }[];
  timeLeft: number;
  champions: Champion[];
  isComplete: boolean;
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  color: 'blue' | 'red';
  score: number;
  totalGold: number;
  kills: number;
  deaths: number;
  assists: number;
  towers: number;
  dragons: number;
  barons: number;
  heralds: number;
}

export interface Item {
  id: string;
  name: string;
  icon: string;
  price: number;
}

export type PlayerRole = 'top' | 'jungle' | 'mid' | 'adc' | 'support';

export interface Player {
  id: string;
  teamId: string;
  name: string;
  avatar: string;
  champion: string;
  championIcon: string;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  gold: number;
  goldDiff: number;
  items: Item[];
  role: PlayerRole;
  level: number;
  damage: number;
  damageTaken: number;
  visionScore: number;
}

export interface GoldPoint {
  time: number;
  blueGold: number;
  redGold: number;
  diff: number;
}

export type EventType =
  | 'first_blood'
  | 'kill'
  | 'tower'
  | 'dragon'
  | 'baron'
  | 'herald'
  | 'teamfight'
  | 'inhibitor'
  | 'surrender'
  | 'aces';

export interface MatchEvent {
  id: string;
  type: EventType;
  time: number;
  timestamp: number;
  title: string;
  description: string;
  teamSide?: 'blue' | 'red';
  playerId?: string;
  replayData: {
    blueGold: number;
    redGold: number;
    blueStats: Partial<Team>;
    redStats: Partial<Team>;
  };
}

export interface MVPData {
  player: Player;
  rating: number;
  criteria: {
    kdaContribution: number;
    damageContribution: number;
    objectiveParticipation: number;
    goldEfficiency: number;
    teamfightImpact: number;
  };
}

export interface Highlight {
  id: string;
  event: MatchEvent;
  thumbnail: string;
  duration: number;
}

export interface MatchData {
  matchId: string;
  title: string;
  format: string;
  currentGame: number;
  totalGames: number;
  gameTime: number;
  status: MatchStatus;
  blueTeam: Team;
  redTeam: Team;
  players: Player[];
  goldHistory: GoldPoint[];
  events: MatchEvent[];
  mvp?: MVPData;
  highlights?: Highlight[];
  winner?: 'blue' | 'red';
  banPick?: BanPickState;
}

export type DataUpdateType =
  | 'TIME_TICK'
  | 'GOLD_UPDATE'
  | 'PLAYER_STATS'
  | 'TEAM_STATS'
  | 'NEW_EVENT'
  | 'STATUS_CHANGE'
  | 'GAME_END';

export interface DataUpdate {
  type: DataUpdateType;
  timestamp: number;
  payload: Partial<MatchData>;
}
