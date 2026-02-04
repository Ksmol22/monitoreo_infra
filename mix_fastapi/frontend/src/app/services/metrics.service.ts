import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Metric } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MetricsService {
  constructor(private api: ApiService) {}

  getAll(params?: any): Observable<Metric[]> {
    return this.api.get<Metric[]>('/v1/metrics/', params);
  }

  getLatest(): Observable<Metric[]> {
    return this.api.get<Metric[]>('/v1/metrics/latest/');
  }

  create(data: Partial<Metric>): Observable<Metric> {
    return this.api.post<Metric>('/v1/metrics/', data);
  }

  bulkCreate(data: Partial<Metric>[]): Observable<Metric[]> {
    return this.api.post<Metric[]>('/v1/metrics/bulk/', data);
  }
}
