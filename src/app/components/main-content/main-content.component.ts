import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InlineMarketsComponent } from '../inline-markets/inline-markets.component';

import { FootballService } from '../../services/football.service';
import { BetSelectionFactory } from '../../services/bet-selection.factory';

import { apiToDomainEvent } from '../../adapters/api-to-domain.adapter';
import { domainToViewEvent } from '../../adapters/domain-to-view.adapter';
import { groupEvents } from '../../services/event-grouper';

import { ViewEvent } from '../../models/view-event.models';
import { DomainEvent, DomainMarket, DomainSelection } from '../../models/domain-event.models';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [CommonModule, InlineMarketsComponent],
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.css']
})
export class MainContentComponent implements OnInit {

  /** grouped UI structure */
  countries: any[] = [];

  /** keep DomainEvents so betslip factory can use them */
  private domainEvents: DomainEvent[] = [];

  constructor(
    private readonly footballService: FootballService,
    private readonly betFactory: BetSelectionFactory
  ) { }

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.footballService.getUpcomingFixtures().subscribe({
      next: apiList => {

        // Convert API → DomainEvent
        this.domainEvents = apiList.map(apiToDomainEvent);

        // Convert DomainEvent → ViewEvent
        const viewEvents: ViewEvent[] = this.domainEvents.map(domainToViewEvent);
        // Group into leagues/countries
        this.countries = groupEvents(viewEvents);
      },
      error: err => console.error("Failed to load events:", err)
    });
  }

  toggleCountry(group: any) {
    group.expanded = !group.expanded;
  }

  /** Toggle inline markets dropdown for an event and load markets from BE if needed */
  toggleEventMarkets(eventView: any) {
    // toggle closed -> open: load markets
    eventView._marketsExpanded = !eventView._marketsExpanded;
    if (eventView._marketsExpanded && !eventView._markets && !eventView._marketsLoading) {
      eventView._marketsLoading = true;
      this.footballService.getEventMarkets(eventView.id).subscribe({
        next: resp => {
          eventView._markets = resp.markets ?? resp; // adapt if payload wraps
          eventView._marketsLoading = false;
        },
        error: err => {
          console.error('Failed to load markets for', eventView.id, err);
          eventView._marketsError = err?.message ?? 'Failed to load markets';
          eventView._marketsLoading = false;
        }
      });
    }
  }

  /** User clicked a selection in API markets dropdown — forward to bet factory */
  selectFromApi(eventView: ViewEvent, apiMarket: any, apiSel: any) {
    const domain = this.domainEvents.find(d => d.id === eventView.id);
    if (!domain) return console.warn('DomainEvent not found for:', eventView.id);

    const marketKey = apiMarket.market; // e.g. MATCH_WINNER
    const sel = { key: apiSel.selection, odds: apiSel.odds, line: apiSel.line };
    this.betFactory.addFromUI(domain, marketKey, sel as any);
  }

  /**
   * UI clicked a selection → we find the DomainEvent and pass it to factory
   */
  select(eventView: ViewEvent, market: DomainMarket, sel: DomainSelection) {
    const domain = this.domainEvents.find(d => d.id === eventView.id);
    if (!domain) return console.warn("DomainEvent not found for:", eventView.id);

    this.betFactory.addFromUI(domain, market.key, sel);
  }

  trackByCountry(_: number, group: any) {
    return group.leagueId ?? group.name ?? _;
  }

  trackByEvent(_: number, e: ViewEvent) {
    return e.id;
  }

  selectionLabel(sel: string): string {
    switch (sel.toUpperCase()) {
      case 'HOME': return '1';
      case 'DRAW': return 'X';
      case 'AWAY': return '2';
      default: return sel;
    }
  }
}
