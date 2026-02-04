import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-metric-card',
  templateUrl: './metric-card.component.html',
  styleUrls: ['./metric-card.component.css']
})
export class MetricCardComponent {
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() subtitle?: string;
  @Input() trend?: 'up' | 'down';
  @Input() trendValue?: string;
  @Input() icon?: string;
}
