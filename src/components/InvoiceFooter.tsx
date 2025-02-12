import { Box, Grid, Paper, TextField, Typography, Divider } from '@mui/material';

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
  previousBalance: number;
  charges: number;
  paidAmount: number;
  onManualDiscountChange: (value: number) => void;
  onPreviousBalanceChange: (value: number) => void;
  onChargesChange: (value: number) => void;
  onPaidAmountChange: (value: number) => void;
}

export const calculateItemTotal = (quantity: number, rate: number, discount: number) => {
  const subtotal = (quantity || 0) * (rate || 0);
  return subtotal * (1 - (discount || 0) / 100);
};

export const calculateTotals = (
  items: InvoiceItem[],
  products: Product[],
  manualDiscount: number,
  previousBalance: number,
  charges: number = 0
) => {
  const subtotal = items.reduce((sum, item) => {
    const itemTotal = calculateItemTotal(item.quantity, item.rate, item.discount);
    return sum + itemTotal;
  }, 0);

  const totalDiscount = manualDiscount || 0;

  const totalTax = items.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    const itemTotal = calculateItemTotal(item.quantity, item.rate, item.discount);
    // Extract tax from item total since products already include tax
    const taxRate = product?.taxPercentage || 0;
    const taxAmount = itemTotal - (itemTotal / (1 + taxRate / 100));
    return sum + taxAmount;
  }, 0);

  // Total is subtotal minus discounts plus previous balance and charges
  const total = subtotal - totalDiscount + (previousBalance || 0) + (charges || 0);

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
  previousBalance,
  charges,
  paidAmount,
  onManualDiscountChange,
  onPreviousBalanceChange,
  onChargesChange,
  onPaidAmountChange,
}: InvoiceFooterProps) => {
  const totals = calculateTotals(items, products, manualDiscount, previousBalance, charges);
  const remainingAmount = totals.total - (paidAmount || 0);

  return (
    <Paper sx={{ mt: 3, p: 3 }}>
      <Grid container spacing={3}>
        {/* Left side - Input fields */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Manual Discount"
                type="number"
                fullWidth
                value={manualDiscount || 0}
                onChange={(e) => onManualDiscountChange(parseFloat(e.target.value) || 0)}
                InputProps={{
                  startAdornment: <Typography color="textSecondary">₹</Typography>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Previous Balance"
                type="number"
                fullWidth
                value={previousBalance || 0}
                onChange={(e) => onPreviousBalanceChange(parseFloat(e.target.value) || 0)}
                InputProps={{
                  startAdornment: <Typography color="textSecondary">₹</Typography>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Additional Charges"
                type="number"
                fullWidth
                value={charges || 0}
                onChange={(e) => onChargesChange(parseFloat(e.target.value) || 0)}
                InputProps={{
                  startAdornment: <Typography color="textSecondary">₹</Typography>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Paid Amount"
                type="number"
                fullWidth
                value={paidAmount || 0}
                onChange={(e) => onPaidAmountChange(parseFloat(e.target.value) || 0)}
                InputProps={{
                  startAdornment: <Typography color="textSecondary">₹</Typography>,
                }}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Right side - Totals */}
        <Grid item xs={12} md={6}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 1.5,
            p: 2,
            bgcolor: 'grey.50',
            borderRadius: 1
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary">Subtotal:</Typography>
              <Typography>₹{totals.subtotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary">Total Discount:</Typography>
              <Typography color="error.main">-₹{totals.totalDiscount.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary">Total Tax:</Typography>
              <Typography>₹{totals.totalTax.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary">Previous Balance:</Typography>
              <Typography>₹{previousBalance.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary">Additional Charges:</Typography>
              <Typography>₹{charges.toFixed(2)}</Typography>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6">₹{totals.total.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary">Paid Amount:</Typography>
              <Typography color="success.main">₹{paidAmount.toFixed(2)}</Typography>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" color={remainingAmount > 0 ? "error.main" : "success.main"}>
                {remainingAmount > 0 ? "Remaining:" : "Change:"}
              </Typography>
              <Typography variant="h6" color={remainingAmount > 0 ? "error.main" : "success.main"}>
                ₹{Math.abs(remainingAmount).toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default InvoiceFooter;
