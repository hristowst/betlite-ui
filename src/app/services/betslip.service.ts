import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BetSelection } from '../components/betslip/betslip.component';

@Injectable({
  providedIn: 'root'
})
export class BetslipService {

  private selectionsSubject = new BehaviorSubject<BetSelection[]>([]);
  selections$ = this.selectionsSubject.asObservable();

  addSelection(selection: BetSelection): void {
    const current = this.selectionsSubject.getValue();
    if (current.some(s => s.id === selection.id)) return;
    this.selectionsSubject.next([...current, selection]);
  }

  removeSelection(id: string): void {
    const updated = this.selectionsSubject.getValue().filter(s => s.id !== id);
    this.selectionsSubject.next(updated);
  }

  clear(): void {
    this.selectionsSubject.next([]);
  }
}
