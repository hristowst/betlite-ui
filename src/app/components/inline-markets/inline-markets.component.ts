import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-inline-markets',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './inline-markets.component.html',
    styleUrls: ['./inline-markets.component.css']
})
export class InlineMarketsComponent implements OnChanges {

    @Input() markets: any[] | null = null;
    @Input() loading = false;
    @Input() error: string | null = null;
    @Input() event: any;

    @Output() selection = new EventEmitter<{ market: any; selection: any }>();

    groupedMarkets: Record<string, any[]> = {};
    groups: { key: string; name: string }[] = [];
    activeGroup: string = '';

    ngOnChanges(changes: SimpleChanges) {
        if (changes['markets'] && this.markets) {
            this.buildGroups();
        }
    }

    buildGroups() {
        this.groupedMarkets = {};
        this.groups = [];

        for (const market of this.markets!) {
            const group = market.selections?.[0]?.group;
            const groupName = market.selections?.[0]?.groupName;

            if (!group) continue;

            if (!this.groupedMarkets[group]) {
                this.groupedMarkets[group] = [];
                this.groups.push({ key: group, name: groupName });
            }

            this.groupedMarkets[group].push(market);
        }

        if (this.groups.length) {
            this.activeGroup = this.groups[0].key;
        }
    }

    setActive(groupKey: string) {
        this.activeGroup = groupKey;
    }

    toggleMarket(market: any, ev: Event) {
        ev.stopPropagation();
        market._expanded = !market._expanded;
    }

    onSelect(market: any, sel: any, ev: Event) {
        ev.stopPropagation();
        this.selection.emit({ market, selection: sel });
    }
}