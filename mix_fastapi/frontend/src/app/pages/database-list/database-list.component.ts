import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SystemsService } from '../../services/systems.service';
import { System } from '../../models';

@Component({
  selector: 'app-database-list',
  templateUrl: './database-list.component.html',
  styleUrls: ['./database-list.component.css']
})
export class DatabaseListComponent implements OnInit {
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
        this.systems = systems.filter(s => s.type === 'database');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading databases:', error);
        this.systems = [];
        this.isLoading = false;
      }
    });
  }

  private getExampleDatabases_REMOVED(): System[] {
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
        metrics: { cpu_usage: 45, memory_usage: 68, disk_usage: 72 }
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
        metrics: { cpu_usage: 65, memory_usage: 78, disk_usage: 88 }
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
        metrics: { cpu_usage: 22, memory_usage: 38, disk_usage: 28 }
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
        metrics: { cpu_usage: 92, memory_usage: 84, disk_usage: 56 }
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
    this.router.navigate(['/databases', systemId]);
  }
}
