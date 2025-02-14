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

interface UnitTotals {
  [key: string]: number;
}

const InvoicePrint = ({ invoiceId }: InvoicePrintProps) => {
  const [invoice, setInvoice] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [unitTotals, setUnitTotals] = useState<UnitTotals>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [invoiceData, companyData] = await Promise.all([
          api.invoices.getById(invoiceId),
          api.company.get(),
        ]);
        setInvoice(invoiceData);
        setCompany(companyData);

        // Calculate unit totals
        const totals = invoiceData.items?.reduce((acc: UnitTotals, item: any) => {
          const unitName = item.unit_name;
          if (!acc[unitName]) {
            acc[unitName] = 0;
          }
          acc[unitName] += item.quantity;
          return acc;
        }, {});
        setUnitTotals(totals || {});
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

  const numberToWords = (num: number) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    const convertLessThanThousand = (n: number): string => {
      if (n === 0) return '';
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) {
        return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
      }
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
    };

    if (num === 0) return 'Zero';

    const billions = Math.floor(num / 1000000000);
    const millions = Math.floor((num % 1000000000) / 1000000);
    const thousands = Math.floor((num % 1000000) / 1000);
    const remainder = num % 1000;

    let words = '';

    if (billions) words += convertLessThanThousand(billions) + ' Billion ';
    if (millions) words += convertLessThanThousand(millions) + ' Million ';
    if (thousands) words += convertLessThanThousand(thousands) + ' Thousand ';
    if (remainder) words += convertLessThanThousand(remainder);

    return words.trim() + ' Rupees Only';
  };

  return (
    <Box sx={{ 
      p: 2, 
      bgcolor: 'white',
      '@media print': {
        p: 0,
        '& .MuiPaper-root': {
          boxShadow: 'none',
          border: 'none',
        },
        '& .MuiTableCell-root': {
          borderColor: '#000',
          py: 0.5,
        },
        '& .MuiTypography-root': {
          color: '#000',
        },
      }
    }}>
      {/* Header */}
      <Grid container spacing={1} sx={{ mb: 1 }}>
        <Grid item xs={7}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {company.logo && (
              <img 
                src={company.logo} 
                alt="Company Logo" 
                style={{ maxWidth: 100, maxHeight: 50 }}
              />
            )}
            <Box>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                {company.name}
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line', fontSize: '0.8rem' }}>
                {company.address}
                {company.gst && ` | GST: ${company.gst}`}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={5} sx={{ textAlign: 'right' }}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            INVOICE
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
            Invoice #: {invoice.invoice_number}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
            Date: {formatDate(invoice.invoice_date)}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
            Due Date: {formatDate(invoice.due_date)}
          </Typography>
        </Grid>
      </Grid>

      {/* Customer Details */}
      <Box sx={{ mb: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ display: 'inline' }}>
              Bill To:
            </Typography>
            <Typography variant="body2" sx={{ display: 'inline', ml: 1 }}>
              {invoice.customer_name}
              {invoice.customer_phone && ` | Phone: ${invoice.customer_phone}`}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Items Table */}
      <Table size="small" sx={{ mb: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ py: 0.5 }}>#</TableCell>
            <TableCell sx={{ py: 0.5 }}>Item</TableCell>
            <TableCell align="right" sx={{ py: 0.5 }}>Quantity</TableCell>
            <TableCell align="right" sx={{ py: 0.5 }}>Rate</TableCell>
            <TableCell align="right" sx={{ py: 0.5 }}>Discount</TableCell>
            <TableCell align="right" sx={{ py: 0.5 }}>Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invoice.items?.map((item: any, index: number) => (
            <TableRow key={index}>
              <TableCell sx={{ py: 0.5 }}>{index + 1}</TableCell>
              <TableCell sx={{ py: 0.5 }}>{item.product_name}</TableCell>
              <TableCell align="right" sx={{ py: 0.5 }}>
                {item.quantity} {item.unit_name}
              </TableCell>
              <TableCell align="right" sx={{ py: 0.5 }}>{formatCurrency(item.rate)}</TableCell>
              <TableCell align="right" sx={{ py: 0.5 }}>{formatCurrency(item.discount)}</TableCell>
              <TableCell align="right" sx={{ py: 0.5 }}>{formatCurrency(item.total)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Unit Summary */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Total Units:
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(unitTotals).map(([unit, total]) => (
            <Grid item xs={4} key={unit}>
              <Typography variant="body2">
                {unit}: {total}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Summary */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Box sx={{ width: 300 }}>
          <Grid container spacing={0.5}>
            <Grid item xs={6}>
              <Typography variant="body2">Subtotal:</Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              <Typography variant="body2">{formatCurrency(invoice.subtotal)}</Typography>
            </Grid>

            {invoice.manual_discount > 0 && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2">Manual Discount:</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">{formatCurrency(invoice.manual_discount)}</Typography>
                </Grid>
              </>
            )}

            {invoice.previous_balance > 0 && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2">Previous Balance:</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">{formatCurrency(invoice.previous_balance)}</Typography>
                </Grid>
              </>
            )}

            {invoice.total_tax > 0 && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2">Tax:</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">{formatCurrency(invoice.total_tax)}</Typography>
                </Grid>
              </>
            )}

            {invoice.charges > 0 && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2">Additional Charges:</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">{formatCurrency(invoice.charges)}</Typography>
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Divider sx={{ my: 0.5 }} />
            </Grid>

            <Grid item xs={6}>
              <Typography variant="subtitle2">Total:</Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle2">{formatCurrency(invoice.total)}</Typography>
            </Grid>

            {invoice.paid_amount > 0 && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2">Paid Amount:</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">{formatCurrency(invoice.paid_amount)}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2">Balance:</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle2">
                    {formatCurrency(invoice.total - invoice.paid_amount)}
                  </Typography>
                </Grid>
              </>
            )}
          </Grid>
        </Box>
      </Box>

      {/* Amount in Words */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Amount in Words: {numberToWords(Math.round(invoice.total))}
        </Typography>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Thank you for your business!
        </Typography>
      </Box>
    </Box>
  );
};

export default InvoicePrint;
