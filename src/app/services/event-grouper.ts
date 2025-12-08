import { ViewEvent } from "../models/view-event.models";

export interface EventGroup {
    name?: string;
    league?: string;
    leagueId?: string | number;
    flag?: string;
    expanded: boolean;
    events: ViewEvent[];
}

export function groupEvents(events: ViewEvent[]): EventGroup[] {
    const groups: Record<string, EventGroup> = {};

    for (const e of events) {
        const key = e.leagueId ?? `${e.country}-${e.league}`;

        if (!groups[key]) {
            groups[key] = {
                name: e.country,
                league: e.league,
                leagueId: e.leagueId,
                flag: e.countryFlag,
                expanded: false,
                events: []
            };
        }

        groups[key].events.push(e);
    }

    return Object.values(groups);
}
