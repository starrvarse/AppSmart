export interface Customer {
  id: number;
  name: string;
  phone?: string;
  type: 'wholesale' | 'retail';
}

export interface ProductUnit {
  id: number;
  unitId: number;
  conversionRate: number;
  retailRate: number;
  wholesaleRate: number;
  unit_name?: string;
}

export interface Product {
  id: number;
  name: string;
  code: string;
  baseRate: number;
  baseWholesaleRate: number | null;
  taxPercentage: number;
  baseUnitId: number;
  base_unit_name?: string;
  units?: ProductUnit[];
}

export interface UnitOption {
  unitId: number;
  conversionRate: number;
  retailRate: number;
  wholesaleRate: number;
  unit_name: string;
}

export interface InvoiceItem {
  productId: number;
  unitId: number;
  quantity: number;
  rate: number;
  discount: number;
  total: number;
  productName?: string;
  unitName?: string;
  product_id?: number;  // From API
  unit_id?: number;     // From API
  product_name?: string; // From API
  unit_name?: string;   // From API
  availableUnits?: UnitOption[];
}

export interface Invoice {
  id: number;
  customerId?: number;
  customer_id?: number;
  invoiceDate?: string;
  invoice_date?: string;
  dueDate?: string;
  due_date?: string;
  manualDiscount?: number;
  manual_discount?: number;
  schemeDiscount?: number;
  scheme_discount?: number;
  totalDiscount?: number;
  total_discount?: number;
  totalTax?: number;
  total_tax?: number;
  charges?: number;
  paid_amount?: number;
  total: number;
  status: 'draft' | 'created' | 'paid' | 'cancelled';
  items?: InvoiceItem[];
}
