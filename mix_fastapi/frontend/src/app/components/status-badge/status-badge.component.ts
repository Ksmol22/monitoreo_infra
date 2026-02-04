import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.css']
})
export class StatusBadgeComponent {
  @Input() status: 'online' | 'offline' | 'warning' = 'offline';

  get badgeClass(): string {
    const baseClass = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    switch (this.status) {
      case 'online':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'offline':
        return `${baseClass} bg-red-100 text-red-800`;
      case 'warning':
        return `${baseClass} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  }

  get displayText(): string {
    return this.status.charAt(0).toUpperCase() + this.status.slice(1);
  }
}
