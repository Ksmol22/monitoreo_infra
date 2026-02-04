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
      this.systems = [];
      this.isLoading = false;
    });
  }

  private getExampleSystems_REMOVED(): System[] {
    return [
      {
        id: 1,
        name: 'SQL-PROD-01',
        type: 'database',
        ip_address: '192.168.1.10',
        status: 'online',
        description: 'Base de datos principal - SQL Server 2019',
        environment: 'production',
        version: '2019',
        last_seen: new Date().toISOString(),
        created_at: new Date(2024, 0, 15).toISOString(),
        updated_at: new Date().toISOString(),
        metrics: {
          cpu_usage: 45,
          memory_usage: 68,
          disk_usage: 72
        }
      },
      {
        id: 2,
        name: 'WIN-APP-01',
        type: 'windows',
        ip_address: '192.168.1.20',
        status: 'online',
        description: 'Servidor de aplicaciones IIS',
        environment: 'production',
        version: 'Windows Server 2022',
        last_seen: new Date().toISOString(),
        created_at: new Date(2024, 1, 10).toISOString(),
        updated_at: new Date().toISOString(),
        metrics: {
          cpu_usage: 32,
          memory_usage: 54,
          disk_usage: 45
        }
      },
      {
        id: 3,
        name: 'RHEL-WEB-01',
        type: 'linux',
        ip_address: '192.168.1.30',
        status: 'online',
        description: 'Servidor web Nginx - RHEL 9',
        environment: 'production',
        version: 'RHEL 9.2',
        last_seen: new Date().toISOString(),
        created_at: new Date(2024, 2, 5).toISOString(),
        updated_at: new Date().toISOString(),
        metrics: {
          cpu_usage: 28,
          memory_usage: 42,
          disk_usage: 35
        }
      },
      {
        id: 4,
        name: 'ORACLE-PROD-02',
        type: 'database',
        ip_address: '192.168.1.11',
        status: 'warning',
        description: 'Oracle Database 19c - Alto uso de disco',
        environment: 'production',
        version: '19c',
        last_seen: new Date().toISOString(),
        created_at: new Date(2024, 0, 20).toISOString(),
        updated_at: new Date().toISOString(),
        metrics: {
          cpu_usage: 65,
          memory_usage: 78,
          disk_usage: 88
        }
      },
      {
        id: 5,
        name: 'WIN-FILE-01',
        type: 'windows',
        ip_address: '192.168.1.21',
        status: 'online',
        description: 'Servidor de archivos - File Server',
        environment: 'production',
        version: 'Windows Server 2019',
        last_seen: new Date().toISOString(),
        created_at: new Date(2024, 3, 12).toISOString(),
        updated_at: new Date().toISOString(),
        metrics: {
          cpu_usage: 18,
          memory_usage: 35,
          disk_usage: 82
        }
      },
      {
        id: 6,
        name: 'RHEL-APP-02',
        type: 'linux',
        ip_address: '192.168.1.31',
        status: 'offline',
        description: 'Servidor de aplicaciones Java - Requiere atención',
        environment: 'production',
        version: 'RHEL 8.8',
        last_seen: new Date(Date.now() - 3600000).toISOString(),
        created_at: new Date(2024, 4, 8).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
        metrics: {
          cpu_usage: 0,
          memory_usage: 0,
          disk_usage: 0
        }
      },
      {
        id: 7,
        name: 'SQL-DEV-01',
        type: 'database',
        ip_address: '192.168.2.10',
        status: 'online',
        description: 'Base de datos desarrollo - SQL Server 2019',
        environment: 'development',
        version: '2019',
        last_seen: new Date().toISOString(),
        created_at: new Date(2024, 5, 15).toISOString(),
        updated_at: new Date().toISOString(),
        metrics: {
          cpu_usage: 22,
          memory_usage: 38,
          disk_usage: 28
        }
      },
      {
        id: 8,
        name: 'WIN-QA-01',
        type: 'windows',
        ip_address: '192.168.2.20',
        status: 'online',
        description: 'Servidor QA - Testing',
        environment: 'staging',
        version: 'Windows Server 2022',
        last_seen: new Date().toISOString(),
        created_at: new Date(2024, 6, 3).toISOString(),
        updated_at: new Date().toISOString(),
        metrics: {
          cpu_usage: 48,
          memory_usage: 62,
          disk_usage: 51
        }
      },
      {
        id: 9,
        name: 'RHEL-DOCKER-01',
        type: 'linux',
        ip_address: '192.168.1.32',
        status: 'online',
        description: 'Servidor Docker - Contenedores',
        environment: 'production',
        version: 'RHEL 9.1',
        last_seen: new Date().toISOString(),
        created_at: new Date(2024, 7, 20).toISOString(),
        updated_at: new Date().toISOString(),
        metrics: {
          cpu_usage: 58,
          memory_usage: 71,
          disk_usage: 64
        }
      },
      {
        id: 10,
        name: 'POSTGRES-PROD-01',
        type: 'database',
        ip_address: '192.168.1.12',
        status: 'warning',
        description: 'PostgreSQL 15 - Alta carga CPU',
        environment: 'production',
        version: '15.4',
        last_seen: new Date().toISOString(),
        created_at: new Date(2024, 8, 10).toISOString(),
        updated_at: new Date().toISOString(),
        metrics: {
          cpu_usage: 92,
          memory_usage: 84,
          disk_usage: 56
        }
      },
      {
        id: 11,
        name: 'WIN-AD-01',
        type: 'windows',
        ip_address: '192.168.1.22',
        status: 'online',
        description: 'Active Directory Domain Controller',
        environment: 'production',
        version: 'Windows Server 2022',
        last_seen: new Date().toISOString(),
        created_at: new Date(2023, 11, 1).toISOString(),
        updated_at: new Date().toISOString(),
        metrics: {
          cpu_usage: 15,
          memory_usage: 45,
          disk_usage: 38
        }
      },
      {
        id: 12,
        name: 'RHEL-MONITOR-01',
        type: 'linux',
        ip_address: '192.168.1.33',
        status: 'online',
        description: 'Servidor de monitoreo - Prometheus',
        environment: 'production',
        version: 'RHEL 9.2',
        last_seen: new Date().toISOString(),
        created_at: new Date(2024, 9, 5).toISOString(),
        updated_at: new Date().toISOString(),
        metrics: {
          cpu_usage: 38,
          memory_usage: 52,
          disk_usage: 67
        }
      }
    ];
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

  get avgCpu(): number {
    if (this.systems.length === 0) return 0;
    const sum = this.systems.reduce((acc, sys) => acc + (sys.metrics?.cpu_usage || 0), 0);
    return Math.round(sum / this.systems.length);
  }

  get avgMemory(): number {
    if (this.systems.length === 0) return 0;
    const sum = this.systems.reduce((acc, sys) => acc + (sys.metrics?.memory_usage || 0), 0);
    return Math.round(sum / this.systems.length);
  }

  get avgDisk(): number {
    if (this.systems.length === 0) return 0;
    const sum = this.systems.reduce((acc, sys) => acc + (sys.metrics?.disk_usage || 0), 0);
    return Math.round(sum / this.systems.length);
  }

  get prodCount(): number {
    return this.systems.filter(s => s.environment === 'production').length;
  }

  get qaCount(): number {
    return this.systems.filter(s => s.environment === 'staging').length;
  }

  get devCount(): number {
    return this.systems.filter(s => s.environment === 'development').length;
  }

  get recentSystems(): System[] {
    return this.systems.slice(0, 5);
  }

  get onlineCount(): number {
    return this.systems.filter(s => s.status === 'online').length;
  }

  get warningCount(): number {
    return this.systems.filter(s => s.status === 'warning').length;
  }

  get offlineCount(): number {
    return this.systems.filter(s => s.status === 'offline').length;
  }

  get windowsCount(): number {
    return this.systems.filter(s => s.type === 'windows').length;
  }

  get linuxCount(): number {
    return this.systems.filter(s => s.type === 'linux').length;
  }

  get databaseCount(): number {
    return this.systems.filter(s => s.type === 'database').length;
  }

  get windowsPercentage(): number {
    if (this.systems.length === 0) return 0;
    return (this.windowsCount / this.systems.length * 100);
  }

  get linuxPercentage(): number {
    if (this.systems.length === 0) return 0;
    return (this.linuxCount / this.systems.length * 100);
  }

  get databasePercentage(): number {
    if (this.systems.length === 0) return 0;
    return (this.databaseCount / this.systems.length * 100);
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
