import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { CommonModule, DecimalPipe, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BetslipService } from '../../services/betslip.service';
import { BetSelection, PlaceBetPayload } from '../../models/betslip.models';
import { BetService } from '../../services/bet.service';

@Component({
  selector: 'app-betslip',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DecimalPipe,
    CurrencyPipe
  ],
  templateUrl: './betslip.component.html',
  styleUrls: ['./betslip.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BetslipComponent {

  @Input() currency: string = 'EUR';
  @Input() minStake: number | null = null;

  @Output() placeBet = new EventEmitter<PlaceBetPayload>();
  @Output() removed = new EventEmitter<string>();
  @Output() cleared = new EventEmitter<void>();

  // --- Reactive State ---
  private stakeSubject = new BehaviorSubject<number>(0);
  stake$ = this.stakeSubject.asObservable();

  selections$!: Observable<ReadonlyArray<BetSelection>>;
  combinedOdds$!: Observable<number>;
  potentialReturn$!: Observable<number>;

  // --- UI ---
  isExpanded = false;

  constructor(private betslipService: BetslipService, private betService: BetService) {
    // 💡 All initialization happens here so betslipService exists
    this.selections$ = this.betslipService.selections$;

    this.combinedOdds$ = this.selections$.pipe(
      map(selections =>
        selections.reduce((prod, sel) => prod * sel.odds, 1)
      )
    );

    this.potentialReturn$ = combineLatest([
      this.stake$,
      this.combinedOdds$
    ]).pipe(
      map(([stake, odds]) => +(stake * odds).toFixed(2))
    );
  }

  // ------------ Actions ------------

  setStake(value: number): void {
    const num = Number(value);
    this.stakeSubject.next(num > 0 ? num : 0);
  }

  removeSelection(id: string): void {
    this.betslipService.removeSelection(id);
    this.removed.emit(id);
  }

  clear(): void {
    this.betslipService.clear();
    this.stakeSubject.next(0);
    this.cleared.emit();
  }

  canPlaceBet(selections: ReadonlyArray<BetSelection>, stake: number): boolean {
    const hasSelections = selections.length > 0;
    const validStake = stake > 0 && (this.minStake == null || stake >= this.minStake);
    return hasSelections && validStake;
  }

  onPlaceBet(
    selections: ReadonlyArray<BetSelection>,
    combinedOdds: number,
    potentialReturn: number
  ): void {

    const stake = this.stakeSubject.getValue();
    if (!this.canPlaceBet(selections, stake)) return;

    const payload = {
      stake,
      currency: this.currency,
      selections: selections.map(s => ({
        matchId: s.matchId,
        market: s.market,
        selection: s.selection,
        line: s.line,
        odds: s.odds
      }))
    };

    this.betService.placeBet('933aead6-d05c-454d-85f6-931f2bc9dd83', payload).subscribe({
      next: (res) => {
        console.log('Bet placed:', res);
        this.clear();
        alert('Bet placed successfully!');
      },
      error: (err) => {
        console.error('Bet failed:', err);
        alert(err.error?.message || 'Failed to place bet');
      }
    });
  }


  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  close(): void {
    this.isExpanded = false;
  }

  trackById(_: number, s: BetSelection) {
    return s.id;
  }
}
