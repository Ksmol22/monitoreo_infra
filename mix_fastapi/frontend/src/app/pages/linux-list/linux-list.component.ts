import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SystemsService } from '../../services/systems.service';
import { System } from '../../models';

@Component({
  selector: 'app-linux-list',
  templateUrl: './linux-list.component.html',
  styleUrls: ['./linux-list.component.css']
})
export class LinuxListComponent implements OnInit {
  systems: System[] = [];
  isLoading = true;
  showAddDialog = false;

  constructor(private systemsService: SystemsService, private router: Router) {}

  ngOnInit(): void {
    this.loadSystems();
  }

  loadSystems(): void {
    this.isLoading = true;
    this.systemsService.getAll().subscribe({
      next: (systems) => {
        this.systems = systems.filter(s => s.type === 'linux');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading Linux systems:', error);
        this.systems = [];
        this.isLoading = false;
      }
    });
  }

  private getExampleLinux_REMOVED(): System[] {
    return [
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
        metrics: { cpu_usage: 28, memory_usage: 42, disk_usage: 35 }
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
        metrics: { cpu_usage: 0, memory_usage: 0, disk_usage: 0 }
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
        metrics: { cpu_usage: 58, memory_usage: 71, disk_usage: 64 }
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
        metrics: { cpu_usage: 38, memory_usage: 52, disk_usage: 67 }
      }
    ];
  }

  get onlineCount(): number {
    return this.systems.filter(s => s.status === 'online').length;
  }

  get problemCount(): number {
    return this.systems.filter(s => s.status !== 'online').length;
  }

  openAddDialog(): void {
    this.showAddDialog = true;
  }

  onSystemAdded(): void {
    this.showAddDialog = false;
    this.loadSystems();
  }

  viewDetail(systemId: number): void {
    this.router.navigate(['/linux', systemId]);
  }
}
