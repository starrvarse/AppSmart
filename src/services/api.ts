const API_URL = 'http://localhost:5001/api';

interface ApiError {
  error: string;
}

interface User {
  id: number;
  email: string;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

interface Unit {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

interface ProductCompany {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

interface ProductUnit {
  id: number;
  unitId: number;
  conversionRate: number;
  retailRate: number;
  wholesaleRate: number;
  unit_name?: string;
}

interface Product {
  id: number;
  name: string;
  code: string;
  categoryId: number;
  baseUnitId: number;
  baseRate: number;
  baseWholesaleRate: number | null;
  hsnCode?: string;
  companyId: number;
  taxPercentage: number;
  created_at: string;
  category_name?: string;
  base_unit_name?: string;
  company_name?: string;
  units?: ProductUnit[];
}

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  type: 'wholesale' | 'retail';
  created_at: string;
}

interface InvoiceItem {
  productId: number;
  unitId: number;
  quantity: number;
  rate: number;
  discount: number;
  total: number;
  product_name?: string;
  unit_name?: string;
}

interface Invoice {
  id: number;
  invoice_number: string;
  customerId: number;
  customer_id: number;
  invoiceDate: string;
  invoice_date: string;
  dueDate: string;
  due_date: string;
  subtotal: number;
  manualDiscount: number;
  manual_discount: number;
  schemeDiscount: number;
  scheme_discount: number;
  totalDiscount: number;
  total_discount: number;
  totalTax: number;
  total_tax: number;
  total: number;
  status: 'draft' | 'created' | 'paid' | 'cancelled';
  created_at: string;
  customer_name?: string;
  customer_phone?: string;
  items?: InvoiceItem[];
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error || 'API Error');
  }
  return response.json();
}

export const api = {
  auth: {
    signUp: async (email: string, password: string): Promise<User> => {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return handleResponse<User>(response);
    },

    signIn: async (email: string, password: string): Promise<User> => {
      const response = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return handleResponse<User>(response);
    },
  },

  categories: {
    create: async (name: string, description?: string): Promise<Category> => {
      const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      return handleResponse<Category>(response);
    },

    update: async (id: number, name: string, description?: string): Promise<Category> => {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      return handleResponse<Category>(response);
    },

    getAll: async (): Promise<Category[]> => {
      const response = await fetch(`${API_URL}/categories`);
      return handleResponse<Category[]>(response);
    },

    delete: async (id: number): Promise<void> => {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
      });
      return handleResponse<void>(response);
    },
  },

  units: {
    create: async (name: string, description?: string): Promise<Unit> => {
      const response = await fetch(`${API_URL}/units`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      return handleResponse<Unit>(response);
    },

    update: async (id: number, name: string, description?: string): Promise<Unit> => {
      const response = await fetch(`${API_URL}/units/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      return handleResponse<Unit>(response);
    },

    getAll: async (): Promise<Unit[]> => {
      const response = await fetch(`${API_URL}/units`);
      return handleResponse<Unit[]>(response);
    },

    delete: async (id: number): Promise<void> => {
      const response = await fetch(`${API_URL}/units/${id}`, {
        method: 'DELETE',
      });
      return handleResponse<void>(response);
    },
  },

  productCompanies: {
    create: async (name: string, description?: string): Promise<ProductCompany> => {
      const response = await fetch(`${API_URL}/product-companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      return handleResponse<ProductCompany>(response);
    },

    update: async (id: number, name: string, description?: string): Promise<ProductCompany> => {
      const response = await fetch(`${API_URL}/product-companies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      return handleResponse<ProductCompany>(response);
    },

    getAll: async (): Promise<ProductCompany[]> => {
      const response = await fetch(`${API_URL}/product-companies`);
      return handleResponse<ProductCompany[]>(response);
    },

    delete: async (id: number): Promise<void> => {
      const response = await fetch(`${API_URL}/product-companies/${id}`, {
        method: 'DELETE',
      });
      return handleResponse<void>(response);
    },
  },

  products: {
    create: async (data: Omit<Product, 'id' | 'created_at'>): Promise<{ id: number }> => {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<{ id: number }>(response);
    },

    update: async (id: number, data: Omit<Product, 'id' | 'created_at'>): Promise<{ id: number }> => {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<{ id: number }>(response);
    },

    getAll: async (): Promise<Product[]> => {
      const response = await fetch(`${API_URL}/products`);
      return handleResponse<Product[]>(response);
    },

    getById: async (id: number): Promise<Product> => {
      const response = await fetch(`${API_URL}/products/${id}`);
      return handleResponse<Product>(response);
    },

    delete: async (id: number): Promise<void> => {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
      });
      return handleResponse<void>(response);
    },
  },

  customers: {
    create: async (data: Omit<Customer, 'id' | 'created_at'>): Promise<{ id: number }> => {
      const response = await fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<{ id: number }>(response);
    },

    update: async (id: number, data: Omit<Customer, 'id' | 'created_at'>): Promise<{ id: number }> => {
      const response = await fetch(`${API_URL}/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<{ id: number }>(response);
    },

    getAll: async (): Promise<Customer[]> => {
      const response = await fetch(`${API_URL}/customers`);
      return handleResponse<Customer[]>(response);
    },

    getById: async (id: number): Promise<Customer> => {
      const response = await fetch(`${API_URL}/customers/${id}`);
      return handleResponse<Customer>(response);
    },

    search: async (query: string): Promise<Customer[]> => {
      const response = await fetch(`${API_URL}/customers/search?query=${encodeURIComponent(query)}`);
      return handleResponse<Customer[]>(response);
    },

    delete: async (id: number): Promise<void> => {
      const response = await fetch(`${API_URL}/customers/${id}`, {
        method: 'DELETE',
      });
      return handleResponse<void>(response);
    },
  },

  invoices: {
    create: async (data: Omit<Invoice, 'id' | 'created_at' | 'invoice_number'>): Promise<{ id: number }> => {
      const response = await fetch(`${API_URL}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<{ id: number }>(response);
    },

    getAll: async (): Promise<Invoice[]> => {
      const response = await fetch(`${API_URL}/invoices`);
      return handleResponse<Invoice[]>(response);
    },

    getById: async (id: number): Promise<Invoice> => {
      const response = await fetch(`${API_URL}/invoices/${id}`);
      return handleResponse<Invoice>(response);
    },

    updateStatus: async (id: number, status: Invoice['status']): Promise<{ id: number; status: Invoice['status'] }> => {
      const response = await fetch(`${API_URL}/invoices/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return handleResponse<{ id: number; status: Invoice['status'] }>(response);
    },

    update: async (id: number, data: Omit<Invoice, 'id' | 'created_at' | 'invoice_number'>): Promise<{ id: number }> => {
      const response = await fetch(`${API_URL}/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<{ id: number }>(response);
    },

    delete: async (id: number): Promise<void> => {
      const response = await fetch(`${API_URL}/invoices/${id}`, {
        method: 'DELETE',
      });
      return handleResponse<void>(response);
    },
  },
};
