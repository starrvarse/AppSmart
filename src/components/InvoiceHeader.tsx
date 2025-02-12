import { Grid, TextField, Autocomplete } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { calculateItemTotal } from './InvoiceFooter';

interface Customer {
  id: number;
  name: string;
  phone?: string;
  type: 'wholesale' | 'retail';
}

interface UnitOption {
  unitId: number;
  conversionRate: number;
  retailRate: number;
  wholesaleRate: number;
  unit_name: string;
}

interface InvoiceItem {
  productId: number;
  unitId: number;
  quantity: number;
  rate: number;
  discount: number;
  total: number;
  availableUnits?: UnitOption[];
}

interface InvoiceHeaderProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  invoiceDate: Date | null;
  dueDate: Date | null;
  onCustomerChange: (customer: Customer | null) => void;
  onInvoiceDateChange: (date: Date | null) => void;
  onDueDateChange: (date: Date | null) => void;
  items: InvoiceItem[];
  onItemsChange: (items: InvoiceItem[]) => void;
}

const InvoiceHeader = ({
  customers,
  selectedCustomer,
  invoiceDate,
  dueDate,
  onCustomerChange,
  onInvoiceDateChange,
  onDueDateChange,
  items,
  onItemsChange,
}: InvoiceHeaderProps) => {
  const handleCustomerChange = (customer: Customer | null) => {
    onCustomerChange(customer);

    // Update rates for all items based on customer type
    if (customer) {
      const newItems = items.map(item => {
        const newItem = { ...item };
        if (item.availableUnits && item.unitId) {
          const selectedUnit = item.availableUnits.find(u => u.unitId === item.unitId);
          if (selectedUnit) {
            newItem.rate = customer.type === 'wholesale'
              ? selectedUnit.wholesaleRate
              : selectedUnit.retailRate;
            newItem.total = calculateItemTotal(newItem.quantity, newItem.rate, newItem.discount);
          }
        }
        return newItem;
      });
      onItemsChange(newItems);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Autocomplete
          options={customers}
          value={selectedCustomer}
          getOptionLabel={(option) => `${option.name} (${option.type})`}
          renderInput={(params) => (
            <TextField {...params} label="Customer" required />
          )}
          onChange={(_, value) => handleCustomerChange(value)}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <DatePicker
          label="Invoice Date"
          value={dayjs(invoiceDate)}
          onChange={(value) => onInvoiceDateChange(value?.toDate() || null)}
          slotProps={{ textField: { fullWidth: true, required: true } }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <DatePicker
          label="Due Date"
          value={dayjs(dueDate)}
          onChange={(value) => onDueDateChange(value?.toDate() || null)}
          slotProps={{ textField: { fullWidth: true, required: true } }}
        />
      </Grid>
    </Grid>
  );
};

export default InvoiceHeader;
