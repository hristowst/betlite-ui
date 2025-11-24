export type BetSelection = {
  id: string;
  matchId: number;         // REQUIRED FOR BACKEND
  market: string;          // "MATCH_WINNER", "OVER_UNDER", etc. (canonical)
  selection: string;       // "HOME", "DRAW", "AWAY"
  line: number | null;     // null for MATCH_WINNER
  odds: number;
};


export type PlaceBetPayload = {
  selections: BetSelection[];
  stake: number;
  combinedOdds: number;
  potentialReturn: number;
};
