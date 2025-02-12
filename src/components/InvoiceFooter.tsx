import { Box, Grid, Paper, TextField, Typography } from '@mui/material';

interface InvoiceItem {
  productId: number;
  quantity: number;
  rate: number;
  discount: number;
  total: number;
}

interface Product {
  id: number;
  taxPercentage: number;
}

interface InvoiceFooterProps {
  items: InvoiceItem[];
  products: Product[];
  manualDiscount: number;
  schemeDiscount: number;
  onManualDiscountChange: (value: number) => void;
  onSchemeDiscountChange: (value: number) => void;
}

export const calculateItemTotal = (quantity: number, rate: number, discount: number) => {
  const subtotal = (quantity || 0) * (rate || 0);
  return subtotal * (1 - (discount || 0) / 100);
};

export const calculateTotals = (
  items: InvoiceItem[],
  products: Product[],
  manualDiscount: number,
  schemeDiscount: number
) => {
  const subtotal = items.reduce((sum, item) => {
    const itemTotal = calculateItemTotal(item.quantity, item.rate, item.discount);
    return sum + itemTotal;
  }, 0);

  const totalDiscount = (manualDiscount || 0) + (schemeDiscount || 0);

    const totalTax = items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      const itemTotal = calculateItemTotal(item.quantity, item.rate, item.discount);
      // Extract tax from item total since products already include tax
      const taxRate = product?.taxPercentage || 0;
      const taxAmount = itemTotal - (itemTotal / (1 + taxRate / 100));
      return sum + taxAmount;
    }, 0);

  // Total is just subtotal minus discounts since tax is already included in the rates
  const total = subtotal - totalDiscount;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    totalDiscount: Number(totalDiscount.toFixed(2)),
    totalTax: Number(totalTax.toFixed(2)),
    total: Number(total.toFixed(2))
  };
};

const InvoiceFooter = ({
  items,
  products,
  manualDiscount,
  schemeDiscount,
  onManualDiscountChange,
  onSchemeDiscountChange,
}: InvoiceFooterProps) => {
  const totals = calculateTotals(items, products, manualDiscount, schemeDiscount);

  return (
    <Paper sx={{ mt: 3, p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            label="Manual Discount"
            type="number"
            fullWidth
            value={manualDiscount || 0}
            onChange={(e) => onManualDiscountChange(parseFloat(e.target.value) || 0)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Scheme Discount"
            type="number"
            fullWidth
            value={schemeDiscount || 0}
            onChange={(e) => onSchemeDiscountChange(parseFloat(e.target.value) || 0)}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 2, textAlign: 'right' }}>
        <Typography>Subtotal: ₹{totals.subtotal.toFixed(2)}</Typography>
        <Typography>Total Discount: ₹{totals.totalDiscount.toFixed(2)}</Typography>
        <Typography>Total Tax: ₹{totals.totalTax.toFixed(2)}</Typography>
        <Typography variant="h6">Total: ₹{totals.total.toFixed(2)}</Typography>
      </Box>
    </Paper>
  );
};

export default InvoiceFooter;
