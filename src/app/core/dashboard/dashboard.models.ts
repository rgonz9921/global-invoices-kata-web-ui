import { InvoiceType } from '../models/invoice.models';

export interface InvoiceTypeSummary {
  type: InvoiceType;
  totalAmount: number;
  invoiceCount: number;
}

export interface DashboardSummary {
  byType: InvoiceTypeSummary[];
  grandTotal: number;
  totalInvoices: number;
}
