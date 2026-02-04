import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SystemsService } from '../../services/systems.service';
import { System } from '../../models';

@Component({
  selector: 'app-database-detail',
  templateUrl: './database-detail.component.html',
  styleUrls: ['./database-detail.component.css']
})
export class DatabaseDetailComponent implements OnInit {
  system: System | null = null;
  isLoading = true;
  systemId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private systemsService: SystemsService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.systemId = +params['id'];
      this.loadSystem();
    });
  }

  loadSystem(): void {
    this.isLoading = true;
    this.systemsService.getById(this.systemId).subscribe({
      next: (system) => {
        this.system = system;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading system:', error);
        this.system = null;
        this.isLoading = false;
      }
    });
  }

  private getExampleSystem_REMOVED(): System {
    return {
      id: this.systemId,
      name: 'DB-ORACLE-01',
      type: 'database',
      ip_address: '192.168.1.30',
      status: 'online',
      description: 'Base de datos Oracle principal',
      environment: 'production',
      version: 'Oracle 19c',
      last_seen: new Date().toISOString(),
      created_at: new Date(2023, 11, 1).toISOString(),
      updated_at: new Date().toISOString(),
      metrics: { cpu_usage: 28, memory_usage: 72, disk_usage: 65 }
    };
  }

  goBack(): void {
    this.router.navigate(['/databases']);
  }

  refreshSystem(): void {
    this.loadSystem();
  }
}
