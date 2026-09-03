import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  CreateInvoiceRequest,
  InvoiceDetailResponse,
  InvoiceListQuery,
  InvoiceResponse,
  PageResponse,
} from '../models/invoice.models';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/invoices`;

  create(request: CreateInvoiceRequest): Observable<InvoiceResponse> {
    return this.http.post<InvoiceResponse>(this.baseUrl, request);
  }

  list(query: InvoiceListQuery = {}): Observable<PageResponse<InvoiceResponse>> {
    let params = new HttpParams();
    if (query.type) {
      params = params.set('type', query.type);
    }
    if (query.page != null) {
      params = params.set('page', query.page);
    }
    if (query.size != null) {
      params = params.set('size', query.size);
    }
    return this.http.get<PageResponse<InvoiceResponse>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<InvoiceDetailResponse> {
    return this.http.get<InvoiceDetailResponse>(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }
}
