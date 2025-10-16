import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { BetslipComponent } from '../betslip/betslip.component';
import { BetSelection } from '../betslip/betslip.component';
import { BetslipService } from '../../services/betslip.service';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.css'],
})
export class MainContentComponent implements OnInit {
  @ViewChild(BetslipComponent) betslip!: BetslipComponent;

  countries: any[] = [];
  private apiUrl = 'https://v3.football.api-sports.io/fixtures';
  private apiKey = '181069c8d59588ffea8d4f0d820761b2';

  constructor(private http: HttpClient, private betslipService: BetslipService) { }

  ngOnInit() {
    this.loadTodayAndTomorrowFixtures();
  }

  /**
   * 📅 Fetch fixtures for today and tomorrow separately (with timezone)
   */
  loadTodayAndTomorrowFixtures() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const todayUrl = `${this.apiUrl}?date=${todayStr}&timezone=Europe/Sofia`;
    const tomorrowUrl = `${this.apiUrl}?date=${tomorrowStr}&timezone=Europe/Sofia`;

    forkJoin([
      this.http.get(todayUrl, { headers: { 'x-apisports-key': this.apiKey } }),
      this.http.get(tomorrowUrl, { headers: { 'x-apisports-key': this.apiKey } }),
    ]).subscribe(([todayRes, tomorrowRes]: any[]) => {
      const combined = [...(todayRes.response || []), ...(tomorrowRes.response || [])];

      const grouped: { [key: string]: any } = {};

      combined.forEach((f: any) => {
        let country = f.league.country || 'World';
        if ([2, 3, 848].includes(f.league.id)) {
          country = 'World';
        }

        const league = f.league.name;
        const countryFlag = f.league.flag || '';
        const key = `${country}-${league}`;

        if (!grouped[key]) {
          grouped[key] = {
            name: country,
            league: league,
            expanded: false,
            fixtures: [],
            flag: countryFlag || '/globe_icon.svg'
          };
        }

        const matchDate = new Date(f.fixture.date);

        grouped[key].fixtures.push({
          id: f.fixture.id,
          date: matchDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          time: matchDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          dateObj: matchDate,
          home: f.teams.home.name,
          away: f.teams.away.name,
          homeFlag: f.teams.home.logo,
          awayFlag: f.teams.away.logo,
          odds: {
            one:
              f.odds?.[0]?.bookmakers?.[0]?.bets?.[0]?.values?.[0]?.odd || '-',
            draw:
              f.odds?.[0]?.bookmakers?.[0]?.bets?.[0]?.values?.[1]?.odd || '-',
            two:
              f.odds?.[0]?.bookmakers?.[0]?.bets?.[0]?.values?.[2]?.odd || '-',
          },
          countryFlag: countryFlag
        });
      });

      // ✅ Sort fixtures by time inside each league
      Object.values(grouped).forEach((group: any) => {
        group.fixtures.sort(
          (a: any, b: any) => a.dateObj.getTime() - b.dateObj.getTime()
        );
      });

      // ✅ Convert to array & sort leagues (World first)
      this.countries = Object.values(grouped).sort((a: any, b: any) => {
        if (a.name === 'World') return -1;
        if (b.name === 'World') return 1;
        return a.league.localeCompare(b.league);
      });
    });
  }

  toggleCountry(country: any) {
    country.expanded = !country.expanded;
  }

  addToBetslip(match: any, type: 'one' | 'draw' | 'two') {
    const rawOdds = match.odds?.[type];
    const parsed = parseFloat(rawOdds);
    const selection: BetSelection = {
      id: `${match.id}-${type}`,
      market: 'Match Winner',
      selection:
        type === 'one' ? match.home : type === 'two' ? match.away : 'Draw',
      odds: isFinite(parsed) ? parsed : 1
    };

    this.betslipService.addSelection(selection); // ✅ now uses the service
  }
}
