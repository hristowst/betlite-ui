import { Component } from '@angular/core';

import { HeaderComponent } from './components/header/header.component';
import { MainContentComponent } from './components/main-content/main-content.component';
import { CommonModule } from '@angular/common';
import { BetslipComponent } from './components/betslip/betslip.component';
import { PlaceBetPayload } from './models/betslip.models';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, MainContentComponent, CommonModule, BetslipComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'betlite365-ui';

  onPlaceBet(payload: PlaceBetPayload) {
    console.log('PLACE BET PAYLOAD:', payload);

    // Next step: forward this to backend service
    // Then clear betslip (I'll wire that next)
  }
}
