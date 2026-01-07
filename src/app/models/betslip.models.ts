export interface BetSelection {
  id: string;            // globally unique for the selection
  matchId: string;       // fixture / match identifier
  market: string;        // e.g. "MATCH_WINNER"
  line: number | null;   // only if the market has a line
  selection: string;     // "HOME" | "DRAW" | "AWAY" | ...
  odds: number;
  sport: string;
  // Optional UI-friendly fields populated when building a selection
  eventName?: string;          // e.g. "Home v Away"
  eventStartTime?: string | Date; // ISO string or Date for Angular date pipe
}

export type PlaceBetPayload = {
  selections: BetSelection[];
  stake: number;
  combinedOdds: number;
  potentialReturn: number;
};
