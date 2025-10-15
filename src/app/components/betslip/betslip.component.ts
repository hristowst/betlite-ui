import { CommonModule, DecimalPipe, CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Inject } from '@angular/core';
import { BetslipService } from '../../services/betslip.service';

export type BetSelection = {
  id: string;
  market: string;
  selection: string;
  odds: number;
};

export type PlaceBetPayload = {
  selections: BetSelection[];
  stake: number;
  combinedOdds: number;
  potentialReturn: number;
};

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

  // ✅ Streams
  selections$!: Observable<BetSelection[]>;
  combinedOdds$!: Observable<number>;
  potentialReturn$!: Observable<number>;

  // ✅ UI state
  stakeValue = 0;
  isExpanded = false;
  constructor(@Inject(BetslipService) private betslipService: BetslipService) {
    // ✅ Initialize streams here (after DI is ready)
    this.selections$ = this.betslipService.selections$;

    this.combinedOdds$ = this.selections$.pipe(
      map(selections =>
        selections.reduce((prod, s) => prod * (Number(s.odds) || 1), 1)
      )
    );

    this.potentialReturn$ = this.combinedOdds$.pipe(
      map(combined => +(this.stakeValue || 0) * combined)
    );
  }

  // --- Betslip Actions ---

  removeSelection(id: string): void {
    this.betslipService.removeSelection(id);
    this.removed.emit(id);
  }

  clear(): void {
    this.betslipService.clear();
    this.cleared.emit();
    this.stakeValue = 0;
  }

  canPlaceBet(selections: BetSelection[]): boolean {
    const hasSelections = selections.length > 0;
    const validStake =
      this.stakeValue > 0 &&
      (this.minStake == null || this.stakeValue >= this.minStake);
    return hasSelections && validStake;
  }

  normalizeStake(): void {
    const n = Number(this.stakeValue);
    if (!isFinite(n) || n < 0) this.stakeValue = 0;
  }

  trackById(_: number, s: BetSelection) {
    return s.id;
  }

  onPlaceBet(
    selections: BetSelection[],
    combinedOdds: number,
    potentialReturn: number
  ): void {
    if (!this.canPlaceBet(selections)) return;
    this.placeBet.emit({
      selections: [...selections],
      stake: +this.stakeValue,
      combinedOdds: +combinedOdds.toFixed(4),
      potentialReturn: +potentialReturn.toFixed(2)
    });
  }

  // --- Mobile expand/collapse ---

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  close(): void {
    this.isExpanded = false;
  }
}
