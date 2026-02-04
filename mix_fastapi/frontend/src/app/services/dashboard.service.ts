import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DashboardStats } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private api: ApiService) {}

  getStats(): Observable<DashboardStats> {
    return this.api.get<DashboardStats>('/v1/dashboard/');
  }
}
