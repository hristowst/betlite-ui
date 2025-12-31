import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BetService } from '../../services/bet.service';

@Component({
    selector: 'app-my-bets',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './my-bets.component.html'
})
export class MyBetsComponent implements OnInit {
    activeTab: 'PENDING' | 'SETTLED' = 'PENDING';
    pendingBets: any[] = [];
    settledBets: any[] = [];

    constructor(private betService: BetService) { }

    ngOnInit(): void {
        this.loadPending();
    }

    loadPending() {
        this.betService.getPendingBets().subscribe(res => {
            this.pendingBets = res;
        });
    }

    loadSettled() {
        this.betService.getSettledBets().subscribe(res => {
            this.settledBets = res;
        });
    }

    switchTab(tab: 'PENDING' | 'SETTLED') {
        this.activeTab = tab;
        tab === 'PENDING' ? this.loadPending() : this.loadSettled();
    }

    combinedOdds(bet: any): number {
        return bet.selections.reduce((prod: number, sel: any) => prod * sel.odds, 1);
    }

    // Format odds for display
    combinedOddsDisplay(bet: any): string {
        return this.combinedOdds(bet).toFixed(2);
    }
}
