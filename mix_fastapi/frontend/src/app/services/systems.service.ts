import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { System } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SystemsService {
  constructor(private api: ApiService) {}

  getAll(): Observable<System[]> {
    return this.api.get<System[]>('/v1/systems/');
  }

  getById(id: number): Observable<System> {
    return this.api.get<System>(`/v1/systems/${id}/`);
  }

  create(data: Partial<System>): Observable<System> {
    return this.api.post<System>('/v1/systems/', data);
  }

  createWithAnsible(data: any): Observable<System> {
    // This endpoint will:
    // 1. Create the system in the database
    // 2. Add the system to Ansible inventory
    // 3. Test the connection
    // 4. Setup monitoring
    return this.api.post<System>('/v1/systems/ansible/', data);
  }

  update(id: number, data: Partial<System>): Observable<System> {
    return this.api.patch<System>(`/v1/systems/${id}/`, data);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/v1/systems/${id}/`);
  }

  getStats(): Observable<any> {
    return this.api.get<any>('/v1/systems/stats/');
  }
}
