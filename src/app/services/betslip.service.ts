import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BetSelection } from '../models/betslip.models';

@Injectable({
  providedIn: 'root'
})
export class BetslipService {

  private readonly maxSelections = 20;

  private selectionsSubject = new BehaviorSubject<ReadonlyArray<BetSelection>>([]);
  selections$ = this.selectionsSubject.asObservable();

  constructor() { }

  /**
   * Adds a new selection.
   * Enforces:
   *   ✔ Only one selection per matchId.
   *   ✔ Blocks exact duplicates.
   */
  addSelection(selection: BetSelection): boolean {
    const current = this.selectionsSubject.getValue();

    // 1️⃣ Block exact duplicate by ID
    if (current.some(s => s.id === selection.id)) {
      return false;
    }

    // 2️⃣ Block ANY other selection from the SAME match
    if (current.some(s => s.matchId === selection.matchId)) {
      return false;
    }

    // 3️⃣ Enforce max selections
    if (current.length >= this.maxSelections) {
      return false;
    }

    // 4️⃣ Add selection
    this.selectionsSubject.next([...current, selection]);
    return true;
  }

  /**
   * Removes a selection by ID.
   */
  removeSelection(id: string): void {
    const updated = this.selectionsSubject
      .getValue()
      .filter(s => s.id !== id);

    this.selectionsSubject.next(updated);
  }

  /**
   * Clears all selections.
   */
  clear(): void {
    this.selectionsSubject.next([]);
  }

  /**
   * Returns a readonly snapshot.
   */
  getSelections(): ReadonlyArray<BetSelection> {
    return this.selectionsSubject.getValue();
  }
}
