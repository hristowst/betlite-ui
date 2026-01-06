import { ViewEvent } from "../models/view-event.models";

export interface EventGroup {
    name?: string;
    league?: string;
    leagueId?: string | number;
    flag?: string;
    expanded: boolean;
    events: ViewEvent[];
}

export function groupEvents(events: ViewEvent[], expandCount = 3): EventGroup[] {
    const groupsMap: Map<string, EventGroup> = new Map();

    for (const e of events) {
        const key = `${e.country}-${e.leagueId}`;

        if (!groupsMap.has(key)) {
            groupsMap.set(key, {
                name: e.country,
                league: e.league,
                leagueId: e.leagueId,
                flag: e.countryFlag,
                expanded: false, // default collapsed
                events: []
            });
        }

        groupsMap.get(key)!.events.push(e);
    }

    const groups = Array.from(groupsMap.values());

    // Expand only the first N groups
    for (let i = 0; i < expandCount && i < groups.length; i++) {
        groups[i].expanded = true;
    }

    return groups;
}
