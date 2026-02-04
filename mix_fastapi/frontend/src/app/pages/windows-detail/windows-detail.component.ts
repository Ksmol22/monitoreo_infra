import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SystemsService } from '../../services/systems.service';
import { System } from '../../models';

@Component({
  selector: 'app-windows-detail',
  templateUrl: './windows-detail.component.html',
  styleUrls: ['./windows-detail.component.css']
})
export class WindowsDetailComponent implements OnInit {
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
    };
  }

  goBack(): void {
    this.router.navigate(['/windows']);
  }

  refreshSystem(): void {
    this.loadSystem();
  }
}
