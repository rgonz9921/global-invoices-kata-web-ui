import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { InvoiceResponse } from '../models/invoice.models';

/** Canal Observer para propagar facturas recien creadas a otros features (p. ej. el dashboard). */
@Injectable({ providedIn: 'root' })
export class InvoiceEventsService {
  private readonly createdSubject = new Subject<InvoiceResponse>();

  readonly created$: Observable<InvoiceResponse> = this.createdSubject.asObservable();

  emitCreated(invoice: InvoiceResponse): void {
    this.createdSubject.next(invoice);
  }
}
