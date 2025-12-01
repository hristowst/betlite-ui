import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BetslipService } from '../../services/betslip.service';
import { BetSelection } from '../../models/betslip.models';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.css'],
})
export class MainContentComponent implements OnInit {

  countries: any[] = [];
  private API = 'https://betlite-be.onrender.com/events/upcoming/football';

  constructor(
    private http: HttpClient,
    private betslip: BetslipService
  ) { }

  ngOnInit() {
    this.loadFixtures();
  }

  loadFixtures() {
    this.http.get<any[]>(this.API).subscribe({
      next: (fixtures) => this.groupFixtures(fixtures),
      error: (err) => console.error('Failed to load fixtures:', err)
    });
  }

  private groupFixtures(fixtures: any[]) {
    const groups: Record<string, any> = {};

    fixtures.forEach((f) => {

      const key = `${f.country}-${f.leagueName}`;

      if (!groups[key]) {
        groups[key] = {
          name: f.country,
          league: f.leagueName,
          leagueId: f.leagueId,
          flag: f.countryFlag,
          expanded: false,
          fixtures: []
        };
      }

      // Convert startTime
      const dateObj = new Date(f.startTime);

      // === EXTRACT ODDS FROM selectionRequest ===
      const homeOdd = f.selectionRequest?.find((s: any) => s.selection === "HOME")?.odds ?? "-";
      const drawOdd = f.selectionRequest?.find((s: any) => s.selection === "DRAW")?.odds ?? "-";
      const awayOdd = f.selectionRequest?.find((s: any) => s.selection === "AWAY")?.odds ?? "-";

      groups[key].fixtures.push({
        id: f.eventId,
        home: f.homeTeam,
        away: f.awayTeam,

        homeFlag: f.homeTeamLogo,
        awayFlag: f.awayTeamLogo,

        dateObj,
        date: dateObj.toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric'
        }),
        time: dateObj.toLocaleTimeString([], {
          hour: '2-digit', minute: '2-digit', hour12: false
        }),

        odds: {
          one: homeOdd,
          draw: drawOdd,
          two: awayOdd,
        }
      });
    });

    this.countries = Object.values(groups);
  }


  toggleCountry(country: any) {
    country.expanded = !country.expanded;
  }

  addToBetslip(match: any, type: 'one' | 'draw' | 'two') {

    const selection: BetSelection = {
      id: `${match.id}-${type}`,
      matchId: match.id,
      market: 'MATCH_WINNER',
      line: null,

      selection:
        type === 'one' ? 'HOME' :
          type === 'two' ? 'AWAY' :
            'DRAW',

      odds: Number(match.odds[type])
    };

    const ok = this.betslip.addSelection(selection);
    if (!ok) {
      console.warn('Selection NOT added — rule violated.');
    }
  }

}
