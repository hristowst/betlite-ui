import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { BetslipComponent } from '../betslip/betslip.component';
import { BetSelection } from '../betslip/betslip.component';
import { BetslipService } from '../../services/betslip.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
  private oddsApiUrl = 'https://v3.football.api-sports.io/odds';
  private apiKey = '181069c8d59588ffea8d4f0d820761b2';
  private supabase: SupabaseClient;

  // 🧠 Weight map: lower number = higher priority
  private LEAGUE_PRIORITY: Record<number, number> = {
    // 🌍 World
    2: 1, 3: 1, 848: 1, 4: 1, 1: 1,

    // 🇧🇬 Bulgaria
    242: 2, 243: 2, 244: 2,

    // 🏴 England
    39: 3, 40: 3, 41: 3, 42: 3, 45: 3, 46: 3,

    // 🇪🇸 Spain
    140: 4, 141: 4, 143: 4,

    // 🇮🇹 Italy
    135: 5, 136: 5, 137: 5,

    // 🇩🇪 Germany
    78: 6, 79: 6, 81: 6,

    // 🇫🇷 France
    61: 7, 62: 7,
  };

  constructor(private http: HttpClient, private betslipService: BetslipService) {
    // ✅ Initialize Supabase client
    this.supabase = createClient(
      'https://fhscqyikizzcdjonczln.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoc2NxeWlraXp6Y2Rqb25jemxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxODA5NjcsImV4cCI6MjA3NTc1Njk2N30.Veapr0lFdeSuHWA3WNwCM93sENeNxxi688d9bK34KxE'
    );
  }

  ngOnInit() {
    this.loadFixturesFromDB();
  }

  /**
   * 📊 Fetch fixtures directly from Supabase
   */
  async loadFixturesFromDB() {
    const { data, error } = await this.supabase
      .from('matches')
      .select('*')
      .eq('status_short', 'NS')
      .order('start_time', { ascending: true });

    if (error) {
      console.error('❌ Failed to fetch fixtures:', error);
      return;
    }

    const grouped: { [key: string]: any } = {};

    (data || []).forEach((f: any) => {
      // ✅ Normalize country name
      let country = (f.country || 'World').trim();
      if ([2, 3, 848].includes(f.league_id)) {
        country = 'World';
      }

      const league = f.league_name;
      const key = `${country}-${league}`;

      if (!grouped[key]) {
        grouped[key] = {
          name: country,
          league: league,
          league_id: f.league_id,
          expanded: false,
          fixtures: [],
          flag:
            f.country_flag ||
            (country === 'World' ? '/globe_icon.svg' : '/flag_placeholder.svg'),
        };
      }

      const matchDate = new Date(f.start_time);

      grouped[key].fixtures.push({
        id: f.id,
        date: matchDate.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        time: matchDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        dateObj: matchDate,
        home: f.home,
        away: f.away,
        homeFlag: f.home_logo || '',
        awayFlag: f.away_logo || '',
        odds: null,
        countryFlag: f.country_flag || grouped[key].flag,
      });
    });

    // ✅ Sort fixtures inside each league by kickoff time
    Object.values(grouped).forEach((group: any) => {
      group.fixtures.sort((a: any, b: any) => {
        const timeDiff = a.dateObj.getTime() - b.dateObj.getTime();
        if (timeDiff !== 0) return timeDiff;
        return a.home.localeCompare(b.home);
      });
    });

    // ✅ Sort leagues with priority → country → league
    this.countries = Object.values(grouped).sort((a: any, b: any) => {
      const aWeight = this.LEAGUE_PRIORITY[a.league_id] || 99;
      const bWeight = this.LEAGUE_PRIORITY[b.league_id] || 99;

      if (aWeight !== bWeight) return aWeight - bWeight;

      const countryCmp = a.name
        .trim()
        .toLowerCase()
        .localeCompare(b.name.trim().toLowerCase(), undefined, { sensitivity: 'base' });
      if (countryCmp !== 0) return countryCmp;

      return a.league.localeCompare(b.league, undefined, { sensitivity: 'base' });
    });
  }

  /**
   * 📂 Toggle dropdown and load odds if expanding for the first time
   */
  toggleCountry(country: any) {
    country.expanded = !country.expanded;
    if (country.expanded) {
      this.loadOddsForCountry(country);
    }
  }

  /**
   * 📈 Load odds from API-Football when user expands a league
   */
  loadOddsForCountry(country: any) {
    const allLoaded = country.fixtures.every((m: any) => m.odds !== null);
    if (allLoaded) return;

    const requests = country.fixtures.map((match: any) => {
      const url = `${this.oddsApiUrl}?fixture=${match.id}&bookmaker=8`;
      return this.http.get<any>(url, {
        headers: { 'x-apisports-key': this.apiKey },
      });
    });

    forkJoin<any[]>(requests).subscribe(
      (oddsResponses) => {
        oddsResponses.forEach((res, i) => {
          const bookmakers = res?.response?.[0]?.bookmakers;
          const oddsData = bookmakers?.[0]?.bets?.[0]?.values || [];
          country.fixtures[i].odds = {
            one: oddsData[0]?.odd || '-',
            draw: oddsData[1]?.odd || '-',
            two: oddsData[2]?.odd || '-',
          };
        });
      },
      (err) => {
        console.error('❌ Failed to load odds:', err);
      }
    );
  }

  /**
   * ➕ Add match to betslip
   */
  addToBetslip(match: any, type: 'one' | 'draw' | 'two') {
    const rawOdds = match.odds?.[type];
    const parsed = parseFloat(rawOdds);
    const selection: BetSelection = {
      id: `${match.id}-${type}`,
      market: 'Match Winner',
      selection:
        type === 'one' ? match.home : type === 'two' ? match.away : 'Draw',
      odds: isFinite(parsed) ? parsed : 1,
    };

    this.betslipService.addSelection(selection);
  }
}
