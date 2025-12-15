import { DomainEvent } from "../models/domain-event.models";
import { ViewEvent } from "../models/view-event.models";

export function domainToViewEvent(domain: DomainEvent): ViewEvent {
    const dateObj = new Date(domain.startTime);

    return {
        id: domain.id,
        sport: domain.sport,

        home: domain.home,
        away: domain.away,
        homeFlag: domain.homeFlag,
        awayFlag: domain.awayFlag,

        league: domain.league,
        leagueId: domain.leagueId,
        country: domain.country,
        countryFlag: domain.countryFlag,

        date: dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
        time: dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        dateObj,

        markets: domain.markets // ← UI gets markets already grouped
    };
}
