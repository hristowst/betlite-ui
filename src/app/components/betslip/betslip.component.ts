import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
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
    DecimalPipe
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
  private readonly stakeSubject = new BehaviorSubject<number | null>(null);
  stake$ = this.stakeSubject.asObservable();

  selections$!: Observable<ReadonlyArray<BetSelection>>;
  combinedOdds$!: Observable<number>;
  potentialReturn$!: Observable<number>;

  // --- UI ---
  isExpanded = false;

  constructor(private readonly betslipService: BetslipService, private readonly betService: BetService) {
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
      map(([stake, odds]) =>
        stake ? +(stake * odds).toFixed(2) : 0
      )
    );
  }

  // ------------ Actions ------------

  setStake(value: number) {
    if (value == null) return;
    this.stakeSubject.next(Math.min(Math.max(value, 0), 1000));
  }

  removeSelection(id: string): void {
    this.betslipService.removeSelection(id);
    this.removed.emit(id);
  }

  clear(): void {
    this.betslipService.clear();
    this.stakeSubject.next(null);
    this.cleared.emit();
  }

  canPlaceBet(
    selections: ReadonlyArray<BetSelection>,
    stake: number | null
  ): boolean {
    const hasSelections = selections.length > 0;
    const validStake =
      stake != null && stake > 0 && (this.minStake == null || stake >= this.minStake);
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
      stake: stake!,
      currency: this.currency,
      selections: selections.map(s => ({
        eventId: s.matchId,
        sport: s.sport,
        market: s.market,
        selection: s.selection,
        line: s.line,
        odds: s.odds
      }))
    };

    this.betService.placeBet(payload).subscribe({
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
