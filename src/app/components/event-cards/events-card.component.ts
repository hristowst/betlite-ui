import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-events-card',
    standalone: true,
    templateUrl: './events-card.component.html',
    styleUrls: ['./events-card.component.css']
})
export class EventsCardComponent {
    @Input() event: any;
}
