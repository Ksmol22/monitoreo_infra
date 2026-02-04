import { Component, OnInit } from '@angular/core';
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

  constructor(private systemsService: SystemsService) {}

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
        this.isLoading = false;
      }
    });
  }

  openAddDialog(): void {
    this.showAddDialog = true;
  }

  onSystemAdded(): void {
    this.showAddDialog = false;
    this.loadSystems();
  }
}
