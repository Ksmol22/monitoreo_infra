import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Log } from '../models';

@Injectable({
  providedIn: 'root'
})
export class LogsService {
  constructor(private api: ApiService) {}

  getAll(params?: any): Observable<Log[]> {
    return this.api.get<Log[]>('/v1/logs/', params);
  }

  getRecent(): Observable<Log[]> {
    return this.api.get<Log[]>('/v1/logs/recent/');
  }

  create(data: Partial<Log>): Observable<Log> {
    return this.api.post<Log>('/v1/logs/', data);
  }
}
