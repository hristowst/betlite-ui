import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.css'],
})
export class MainContentComponent implements OnInit {
  countries: any[] = [];

  private API = 'https://betlite-be.onrender.com/fixtures/upcoming';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadFixtures();
  }

  loadFixtures() {
    this.http.get<any[]>(this.API).subscribe({
      next: (fixtures) => {
        this.groupFixtures(fixtures);
      },
      error: (err) => {
        console.error('Failed to load fixtures:', err);
      }
    });
  }

  /**
   * Group fixtures by "country + league" to match HTML structure
   */
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

      const dateObj = new Date(f.startTime);

      groups[key].fixtures.push({
        id: f.id,
        home: f.homeTeamName,
        away: f.awayTeamName,
        homeFlag: f.homeTeamFlag,
        awayFlag: f.awayTeamFlag,
        dateObj,
        date: dateObj.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        time: dateObj.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        odds: {
          one: f.miniOdds?.home.toFixed(2) ?? '-',
          draw: f.miniOdds?.draw.toFixed(2) ?? '-',
          two: f.miniOdds?.away.toFixed(2) ?? '-',
        }
      });
    });

    this.countries = Object.values(groups);
  }

  toggleCountry(country: any) {
    country.expanded = !country.expanded;
  }

  addToBetslip(match: any, type: 'one' | 'draw' | 'two') {
    console.log('CLICKED', match, type);
  }
}
