export interface DomainSelection {
    key: string;        // HOME, AWAY, OVER, UNDER, YES, NO, etc
    odds: number;
    line: number | null;
}

export interface DomainMarket {
    key: string;                         // e.g. MATCH_WINNER, OVER_UNDER, HANDICAP
    selections: DomainSelection[];
}

export interface DomainEvent {
    id: number;

    sport: string;                       // FOOTBALL, BASKETBALL, TENNIS...

    leagueId: string | number;
    league: string;
    country: string;
    countryFlag?: string;

    home: string;
    away: string;
    homeFlag?: string;
    awayFlag?: string;

    startTime: string;

    markets: DomainMarket[];
}
