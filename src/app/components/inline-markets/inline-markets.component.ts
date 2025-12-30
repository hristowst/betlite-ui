import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-inline-markets',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './inline-markets.component.html',
    styleUrls: ['./inline-markets.component.css']
})
export class InlineMarketsComponent {
    @Input() markets: any[] | null = null;
    @Input() loading = false;
    @Input() error: string | null = null;

    // Parent passes the `event` context so selection events can include it if desired
    @Input() event: any;

    @Output() selection = new EventEmitter<{ market: any; selection: any }>();

    onSelect(market: any, sel: any, ev: Event) {
        ev.stopPropagation();
        this.selection.emit({ market, selection: sel });
    }

}
