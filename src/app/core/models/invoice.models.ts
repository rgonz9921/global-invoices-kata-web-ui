export type InvoiceType = 'NACIONAL' | 'EXPORTACION' | 'GUBERNAMENTAL';

export const INVOICE_TYPES: readonly InvoiceType[] = ['NACIONAL', 'EXPORTACION', 'GUBERNAMENTAL'];

export interface CreateInvoiceRequest {
  type: InvoiceType;
  description: string;
  subtotal: number;
  customsCode?: string;
}

export interface InvoiceTotals {
  subtotal: number;
  iva: number;
  retencion: number;
  total: number;
}

export interface InvoiceResponse {
  id: string;
  type: InvoiceType;
  description: string;
  subtotal: number;
  customsCode: string | null;
  totals: InvoiceTotals;
  createdAt: string;
  createdBy: string;
}

export interface InvoiceDetailResponse {
  id: string;
  type: InvoiceType;
  description: string;
  subtotal: number;
  customsCode?: string | null;
  totals: InvoiceTotals;
  createdAt: string;
  createdBy: string;
  amountInWords?: string | null;
  amountInWordsAvailable: boolean;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface InvoiceListQuery {
  type?: InvoiceType;
  page?: number;
  size?: number;
}

/** Forma del cuerpo de error de validacion del backend (400). */
export interface ApiValidationError {
  status: number;
  error: string;
  message: string;
  fields?: Record<string, string>;
  timestamp: string;
}
