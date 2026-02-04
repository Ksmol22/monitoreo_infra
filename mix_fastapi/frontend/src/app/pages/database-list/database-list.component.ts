import { Component, OnInit } from '@angular/core';
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

  constructor(private systemsService: SystemsService) {}

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
