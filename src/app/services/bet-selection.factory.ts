import { Injectable } from "@angular/core";
import { BetSelection } from "../models/betslip.models";
import { BetslipService } from "./betslip.service";
import { DomainEvent, DomainSelection } from "../models/domain-event.models";

@Injectable({ providedIn: "root" })
export class BetSelectionFactory {

    constructor(private readonly betslip: BetslipService) { }

    /**
     * Create a normalized BetSelection from a domain selection.
     */
    build(
        event: DomainEvent,
        marketKey: string,
        sel: DomainSelection
    ): BetSelection {

        const id = [
            event.id,
            marketKey,
            sel.key,
            sel.line ?? ""
        ].join("-");

        return {
            id,
            matchId: String(event.id),
            sport: event.sport,
            market: marketKey,
            selection: sel.key,
            odds: sel.odds,
            line: sel.line
        };
    }

    /**
     * Add a selection triggered by UI clicking an odds button.
     */
    addFromUI(event: DomainEvent, marketKey: string, sel: DomainSelection) {
        const built = this.build(event, marketKey, sel);

        const ok = this.betslip.addSelection(built);
        if (!ok) console.warn("Selection NOT added due to conflict:", built);
    }

    /**
     * Add selection coming from server (e.g., saved betslip).
     */
    addFromServer(event: DomainEvent, server: {
        market: string;
        selection: string;
        odds: number | string | null;
        line: number | string | null;
    }) {

        const sel: DomainSelection = {
            key: server.selection.toUpperCase(),
            odds: server.odds != null ? Number(server.odds) : 0,
            line: server.line != null ? Number(server.line) : null
        };

        this.addFromUI(event, server.market.toUpperCase(), sel);
    }
}
