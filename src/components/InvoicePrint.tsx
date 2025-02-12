import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Divider,
} from '@mui/material';
import { api } from '../services/api';

interface InvoicePrintProps {
  invoiceId: number;
}

const InvoicePrint = ({ invoiceId }: InvoicePrintProps) => {
  const [invoice, setInvoice] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [invoiceData, companyData] = await Promise.all([
          api.invoices.getById(invoiceId),
          api.company.get(),
        ]);
        setInvoice(invoiceData);
        setCompany(companyData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [invoiceId]);

  if (loading || !invoice || !company) {
    return null;
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  return (
    <Box sx={{ 
      p: 4, 
      bgcolor: 'white',
      '@media print': {
        p: 0,
        '& .MuiPaper-root': {
          boxShadow: 'none',
          border: 'none',
        },
        '& .MuiTableCell-root': {
          borderColor: '#000',
        },
        '& .MuiTypography-root': {
          color: '#000',
        },
      }
    }}>
      {/* Header */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6}>
          {company.logo && (
            <Box sx={{ mb: 2 }}>
              <img 
                src={company.logo} 
                alt="Company Logo" 
                style={{ maxWidth: 200, maxHeight: 80 }}
              />
            </Box>
          )}
          <Typography variant="h5" sx={{ mb: 1 }}>
            {company.name}
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
            {company.address}
          </Typography>
          {company.gst && (
            <Typography variant="body2">
              GST: {company.gst}
            </Typography>
          )}
        </Grid>
        <Grid item xs={6} sx={{ textAlign: 'right' }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            INVOICE
          </Typography>
          <Typography variant="body1">
            Invoice #: {invoice.invoice_number}
          </Typography>
          <Typography variant="body1">
            Date: {formatDate(invoice.invoice_date)}
          </Typography>
          <Typography variant="body1">
            Due Date: {formatDate(invoice.due_date)}
          </Typography>
        </Grid>
      </Grid>

      {/* Customer Details */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Bill To:
        </Typography>
        <Typography variant="body1">
          {invoice.customer_name}
        </Typography>
        {invoice.customer_phone && (
          <Typography variant="body1">
            Phone: {invoice.customer_phone}
          </Typography>
        )}
      </Paper>

      {/* Items Table */}
      <Table sx={{ mb: 4 }}>
        <TableHead>
          <TableRow>
            <TableCell>Item</TableCell>
            <TableCell align="right">Quantity</TableCell>
            <TableCell align="right">Rate</TableCell>
            <TableCell align="right">Discount</TableCell>
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invoice.items?.map((item: any, index: number) => (
            <TableRow key={index}>
              <TableCell>{item.product_name}</TableCell>
              <TableCell align="right">
                {item.quantity} {item.unit_name}
              </TableCell>
              <TableCell align="right">{formatCurrency(item.rate)}</TableCell>
              <TableCell align="right">{formatCurrency(item.discount)}</TableCell>
              <TableCell align="right">{formatCurrency(item.total)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Summary */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
        <Box sx={{ width: 300 }}>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography>Subtotal:</Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              <Typography>{formatCurrency(invoice.subtotal)}</Typography>
            </Grid>

            {invoice.manual_discount > 0 && (
              <>
                <Grid item xs={6}>
                  <Typography>Manual Discount:</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography>{formatCurrency(invoice.manual_discount)}</Typography>
                </Grid>
              </>
            )}

            {invoice.previous_balance > 0 && (
              <>
                <Grid item xs={6}>
                  <Typography>Previous Balance:</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography>{formatCurrency(invoice.previous_balance)}</Typography>
                </Grid>
              </>
            )}

            {invoice.total_tax > 0 && (
              <>
                <Grid item xs={6}>
                  <Typography>Tax:</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography>{formatCurrency(invoice.total_tax)}</Typography>
                </Grid>
              </>
            )}

            {invoice.charges > 0 && (
              <>
                <Grid item xs={6}>
                  <Typography>Additional Charges:</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography>{formatCurrency(invoice.charges)}</Typography>
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            <Grid item xs={6}>
              <Typography variant="h6">Total:</Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              <Typography variant="h6">{formatCurrency(invoice.total)}</Typography>
            </Grid>

            {invoice.paid_amount > 0 && (
              <>
                <Grid item xs={6}>
                  <Typography>Paid Amount:</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography>{formatCurrency(invoice.paid_amount)}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="h6">Balance:</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="h6">
                    {formatCurrency(invoice.total - invoice.paid_amount)}
                  </Typography>
                </Grid>
              </>
            )}
          </Grid>
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Thank you for your business!
        </Typography>
      </Box>
    </Box>
  );
};

export default InvoicePrint;
