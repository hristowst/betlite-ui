import { DomainMarket } from "./domain-event.models";

export interface ViewEvent {
    id: number;
    sport: string;

    home: string;
    away: string;
    homeFlag?: string;
    awayFlag?: string;

    leagueId: string | number;
    league: string;
    country: string;
    countryFlag?: string;

    date: string;
    time: string;
    dateObj: Date;

    markets: DomainMarket[];
}
