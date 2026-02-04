import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SystemsService } from '../../services/systems.service';
import { System } from '../../models';

@Component({
  selector: 'app-linux-detail',
  templateUrl: './linux-detail.component.html',
  styleUrls: ['./linux-detail.component.css']
})
export class LinuxDetailComponent implements OnInit {
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
      name: 'RHEL-WEB-01',
      type: 'linux',
      ip_address: '192.168.1.10',
      status: 'online',
      description: 'Servidor web Apache',
      environment: 'production',
      version: 'RHEL 8.5',
      last_seen: new Date().toISOString(),
      created_at: new Date(2024, 0, 15).toISOString(),
      updated_at: new Date().toISOString(),
      metrics: { cpu_usage: 45, memory_usage: 68, disk_usage: 52 }
    };
  }

  goBack(): void {
    this.router.navigate(['/linux']);
  }

  refreshSystem(): void {
    this.loadSystem();
  }
}
