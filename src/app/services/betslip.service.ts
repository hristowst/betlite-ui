import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BetSelection } from '../models/betslip.models';

@Injectable({
  providedIn: 'root'
})
export class BetslipService {

  // --- Settings ---
  private readonly maxSelections = 20;
  private readonly autoReplaceSameMatch = true;

  private selectionsSubject = new BehaviorSubject<ReadonlyArray<BetSelection>>([]);
  selections$ = this.selectionsSubject.asObservable();

  constructor() {}

  /**
   * Attempts to add a selection and returns whether it succeeded.
   */
  addSelection(selection: BetSelection): boolean {
    let current = this.selectionsSubject.getValue();

    // 1️⃣ Block duplicate selection by ID
    if (current.some(s => s.id === selection.id)) {
      return false;
    }

    // Extract match ID (matchId comes before "-one")
    // Example: "12345-one"
    const matchId = selection.id.split('-')[0];

    const existingFromSameMatch = current.find(s => s.id.startsWith(matchId));

    // 2️⃣ If same match but different outcome
    if (existingFromSameMatch) {
      if (this.autoReplaceSameMatch) {
        // Replace old selection with new one
        current = current.filter(s => !s.id.startsWith(matchId));
      } else {
        // Simply block it
        return false;
      }
    }

    // 3️⃣ Enforce max selections
    if (current.length >= this.maxSelections) {
      return false;
    }

    // Push updated
    this.selectionsSubject.next([...current, selection]);

    return true;
  }

  removeSelection(id: string): void {
    const updated = this.selectionsSubject
      .getValue()
      .filter(s => s.id !== id);

    this.selectionsSubject.next(updated);
  }

  clear(): void {
    this.selectionsSubject.next([]);
  }

  getSelections(): ReadonlyArray<BetSelection> {
    return this.selectionsSubject.getValue();
  }
}
