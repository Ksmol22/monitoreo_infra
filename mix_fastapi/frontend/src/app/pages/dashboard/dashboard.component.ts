import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { SystemsService } from '../../services/systems.service';
import { System, DashboardStats } from '../../models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  systems: System[] = [];
  stats: DashboardStats | null = null;
  isLoading = true;
  showAddDialog = false;
  currentTime: Date = new Date();
  private timeInterval: any;

  constructor(
    private dashboardService: DashboardService,
    private systemsService: SystemsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
    // Update current time every second
    this.timeInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  loadData(): void {
    this.isLoading = true;
    
    Promise.all([
      this.dashboardService.getStats().toPromise(),
      this.systemsService.getAll().toPromise()
    ]).then(([stats, systems]) => {
      this.stats = stats || null;
      this.systems = systems || [];
      this.isLoading = false;
    }).catch(error => {
      console.error('Error loading dashboard data:', error);
      this.isLoading = false;
    });
  }

  get total(): number {
    return this.systems.length;
  }

  get online(): number {
    return this.systems.filter(s => s.status === 'online').length;
  }

  get warnings(): number {
    return this.systems.filter(s => s.status === 'warning').length;
  }

  get offline(): number {
    return this.systems.filter(s => s.status === 'offline').length;
  }

  get dbCount(): number {
    return this.systems.filter(s => s.type === 'database').length;
  }

  get winCount(): number {
    return this.systems.filter(s => s.type === 'windows').length;
  }

  get linCount(): number {
    return this.systems.filter(s => s.type === 'linux').length;
  }

  get healthScore(): number {
    return this.total > 0 ? Math.round((this.online / this.total) * 100) : 0;
  }

  get recentSystems(): System[] {
    return this.systems.slice(0, 5);
  }

  navigateToWindows(): void {
    this.router.navigate(['/windows']);
  }

  navigateToLinux(): void {
    this.router.navigate(['/linux']);
  }

  navigateToDatabases(): void {
    this.router.navigate(['/databases']);
  }

  openAddDialog(): void {
    this.showAddDialog = true;
  }

  closeAddDialog(): void {
    this.showAddDialog = false;
    this.loadData();
  }

  onSystemAdded(system: any): void {
    console.log('System added:', system);
    this.closeAddDialog();
  }

  viewSystemDetail(id: number): void {
    // TODO: Navigate to system detail page
    console.log('View system detail:', id);
  }
}
