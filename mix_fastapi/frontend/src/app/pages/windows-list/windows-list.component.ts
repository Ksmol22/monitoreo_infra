import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SystemsService } from '../../services/systems.service';
import { System } from '../../models';

@Component({
  selector: 'app-windows-list',
  templateUrl: './windows-list.component.html',
  styleUrls: ['./windows-list.component.css']
})
export class WindowsListComponent implements OnInit {
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
        this.systems = systems.filter(s => s.type === 'windows');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading Windows systems:', error);
        this.systems = [];
        this.isLoading = false;
      }
    });
  }

  private getExampleWindows_REMOVED(): System[] {
    return [
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
        metrics: { cpu_usage: 32, memory_usage: 54, disk_usage: 45 }
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
        metrics: { cpu_usage: 18, memory_usage: 35, disk_usage: 82 }
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
        metrics: { cpu_usage: 48, memory_usage: 62, disk_usage: 51 }
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
        metrics: { cpu_usage: 15, memory_usage: 45, disk_usage: 38 }
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
    this.router.navigate(['/windows', systemId]);
  }
}
