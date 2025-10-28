export type GameListItem = {
  gamePk: number;
  awayName: string;
  homeName: string;
  status: 'Scheduled' | 'Live' | 'Final' | 'In Progress' | 'Game Over' | 'Pre-Game' | string;
  gameDateISO: string; // from API, UTC
};

export type BatterGameLog = {
  result: string;
  isHit: boolean;
  isAtBat: boolean;
};

export type LiveGame = {
  gamePk: number;
  inning: number | null;
  isTopInning: boolean | null; // true=表, false=裏
  awayName: string;
  homeName: string;
  awayRuns: number;
  homeRuns: number;
  batterName: string | null;
  batterStats: {
    avg: string;
    atBats: number;
    hits: number;
  } | null;
  batterGameLog: BatterGameLog[] | null;
  pitcherName: string | null;
  count: { balls: number; strikes: number; outs: number } | null;
  bases: { first: boolean; second: boolean; third: boolean; };
  pitcherStats: {
    pitchCount: number;
    battersFaced: number;
    era: string;
  } | null;
  status: string; // 'Live' | 'Final' | etc
  lastUpdated: number; // epoch ms
};

// MLB APIの生データ構造（一部抜粋、必要なものだけ）
export type MLBScheduleResponse = {
  dates: {
    games: {
      gamePk: number;
      teams: {
        away: { team: { name: string } };
        home: { team: { name: string } };
      };
      status: { detailedState: string };
      gameDate: string; // UTC ISO string
    }[];
  }[];
};

export type PitchingStats = {
  pitchesThrown?: number;
  battersFaced?: number;
  era?: string;
  inningsPitched?: string;
  earnedRuns?: number;
};

export type BattingStats = {
  avg?: string;
  atBats?: number;
  hits?: number;
};

export type PlayerStats = {
  person: {
    id: number;
    fullName: string;
  };
  stats: { // Game stats
    pitching?: PitchingStats;
    batting?: BattingStats;
  };
  seasonStats?: { // Season stats
    pitching?: PitchingStats;
    batting?: BattingStats;
  };
  postseasonStats?: { // Postseason stats
    pitching?: PitchingStats;
    batting?: BattingStats;
  };
};

export type MLBLiveGameResponse = {
  gamePk: number;
  gameData: {
    game?: {
      type: string; // 'R' for regular, 'F'/'D'/'L'/'W' for postseason
    };
    teams: {
        away: { name: string };
        home: { name: string };
    };
    status: { detailedState: string };
  };
  liveData: {
    linescore: {
      currentInning?: number;
      inningHalf?: 'Top' | 'Bottom';
      teams: {
        away: { runs?: number };
        home: { runs?: number };
      };
      outs?: number;
      offense?: {
        first?: object;
        second?: object;
        third?: object;
      };
    };
    plays: {
      currentPlay?: {
        matchup: {
          batter: { fullName: string; id: number; };
          pitcher: { fullName:string; id: number; };
        };
        count: { balls: number; strikes: number; outs: number };
        playEvents?: {
          count?: {
            balls: number;
            strikes: number;
          };
        }[];
        runners?: {
          movement: {
            end?: '1B' | '2B' | '3B' | 'score';
          };
        }[];
      };
      allPlays?: {
        result: {
            description?: string;
        };
        matchup: {
            batter: {
                id: number;
            };
        };
      }[];
    };
    boxscore?: {
      teams: {
        away: { players: { [key: string]: PlayerStats } };
        home: { players: { [key: string]: PlayerStats } };
      };
    };
  };
};