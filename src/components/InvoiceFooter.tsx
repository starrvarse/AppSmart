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
    const taxRate = product?.taxPercentage || 0;
    const taxAmount = itemTotal - (itemTotal / (1 + taxRate / 100));
    return sum + taxAmount;
  }, 0);

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
    <Paper sx={{ mt: 1, p: 1.5 }}>
      <Grid container spacing={2}>
        {/* Left side - Input fields */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <TextField
                size="small"
                label="Manual Discount"
                type="number"
                fullWidth
                value={manualDiscount || 0}
                onChange={(e) => onManualDiscountChange(parseFloat(e.target.value) || 0)}
                InputProps={{
                  startAdornment: <Typography variant="body2" color="textSecondary">₹</Typography>,
                }}
                InputLabelProps={{ 
                  sx: { fontSize: '0.875rem' } 
                }}
                inputProps={{
                  style: { fontSize: '0.875rem' }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                size="small"
                label="Previous Balance"
                type="number"
                fullWidth
                value={previousBalance || 0}
                onChange={(e) => onPreviousBalanceChange(parseFloat(e.target.value) || 0)}
                InputProps={{
                  startAdornment: <Typography variant="body2" color="textSecondary">₹</Typography>,
                }}
                InputLabelProps={{ 
                  sx: { fontSize: '0.875rem' } 
                }}
                inputProps={{
                  style: { fontSize: '0.875rem' }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                size="small"
                label="Additional Charges"
                type="number"
                fullWidth
                value={charges || 0}
                onChange={(e) => onChargesChange(parseFloat(e.target.value) || 0)}
                InputProps={{
                  startAdornment: <Typography variant="body2" color="textSecondary">₹</Typography>,
                }}
                InputLabelProps={{ 
                  sx: { fontSize: '0.875rem' } 
                }}
                inputProps={{
                  style: { fontSize: '0.875rem' }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                size="small"
                label="Paid Amount"
                type="number"
                fullWidth
                value={paidAmount || 0}
                onChange={(e) => onPaidAmountChange(parseFloat(e.target.value) || 0)}
                InputProps={{
                  startAdornment: <Typography variant="body2" color="textSecondary">₹</Typography>,
                }}
                InputLabelProps={{ 
                  sx: { fontSize: '0.875rem' } 
                }}
                inputProps={{
                  style: { fontSize: '0.875rem' }
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
            gap: 0.75,
            p: 1.5,
            bgcolor: 'grey.50',
            borderRadius: 1
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Subtotal:</Typography>
              <Typography variant="body2">₹{totals.subtotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Total Discount:</Typography>
              <Typography variant="body2" color="error.main">-₹{totals.totalDiscount.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Total Tax:</Typography>
              <Typography variant="body2">₹{totals.totalTax.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Previous Balance:</Typography>
              <Typography variant="body2">₹{previousBalance.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Additional Charges:</Typography>
              <Typography variant="body2">₹{charges.toFixed(2)}</Typography>
            </Box>
            <Divider sx={{ my: 0.5 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2">Total:</Typography>
              <Typography variant="subtitle2">₹{totals.total.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Paid Amount:</Typography>
              <Typography variant="body2" color="success.main">₹{paidAmount.toFixed(2)}</Typography>
            </Box>
            <Divider sx={{ my: 0.5 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2" color={remainingAmount > 0 ? "error.main" : "success.main"}>
                {remainingAmount > 0 ? "Remaining:" : "Change:"}
              </Typography>
              <Typography variant="subtitle2" color={remainingAmount > 0 ? "error.main" : "success.main"}>
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
