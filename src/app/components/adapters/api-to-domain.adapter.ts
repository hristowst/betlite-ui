import { DomainEvent, DomainMarket, DomainSelection } from "../../models/domain-event.models";

export function apiToDomainEvent(api: any): DomainEvent {

    // 1. Group selections by market
    const marketGroups: Record<string, DomainSelection[]> = {};

    for (const s of api.selectionRequest ?? []) {
        const m = s.market.toUpperCase();

        if (!marketGroups[m]) marketGroups[m] = [];

        marketGroups[m].push({
            key: s.selection.toUpperCase(),
            odds: s.odds != null ? Number(s.odds) : 0,
            line: s.line != null ? Number(s.line) : null
        });
    }

    // 2. Convert grouped records into DomainMarket[]
    const markets: DomainMarket[] = Object.entries(marketGroups).map(
        ([marketKey, selections]) => ({
            key: marketKey,
            selections
        })
    );

    return {
        id: api.eventId,

        sport: api.selectionRequest?.[0]?.sport ?? "UNKNOWN",

        leagueId: api.leagueId,
        league: api.leagueName,
        country: api.country,
        countryFlag: api.countryFlag,

        home: api.homeTeam,
        away: api.awayTeam,
        homeFlag: api.homeTeamLogo,
        awayFlag: api.awayTeamLogo,

        startTime: api.startTime,

        markets
    };
}
