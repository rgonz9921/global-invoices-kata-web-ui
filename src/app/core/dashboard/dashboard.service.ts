import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { DashboardSummary } from './dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/dashboard/summary`;

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(this.url);
  }
}
