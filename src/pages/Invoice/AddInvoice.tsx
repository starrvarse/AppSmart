import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  IconButton,
  Typography,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import dayjs from 'dayjs';
import { api } from '../../services/api';
import AuthLayout from '../../components/Layout/AuthLayout';
import InvoiceFooter, { calculateTotals } from '../../components/InvoiceFooter';
import InvoiceHeader from '../../components/InvoiceHeader';
import InvoiceItems from '../../components/InvoiceItems';
import { Customer, Product, InvoiceItem } from '../../types/invoice';

const AddInvoicePage = () => {
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [invoiceDate, setInvoiceDate] = useState<Date | null>(new Date());
  const [dueDate, setDueDate] = useState<Date | null>(new Date());
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [manualDiscount, setManualDiscount] = useState(0);
  const [previousBalance, setPreviousBalance] = useState(0);
  const [charges, setCharges] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [customersData, productsData] = await Promise.all([
          api.customers.getAll(),
          api.products.getAll(),
        ]);
        setCustomers(customersData);
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const handleSave = async (status: 'draft' | 'created') => {
    if (!customerId || !invoiceDate || !dueDate) return;

    const { subtotal, totalDiscount, totalTax, total } = calculateTotals(
      items,
      products,
      manualDiscount,
      previousBalance,
      charges
    );

    const formattedInvoiceDate = dayjs(invoiceDate).format('YYYY-MM-DD');
    const formattedDueDate = dayjs(dueDate).format('YYYY-MM-DD');

    try {
      setLoading(true);
      await api.invoices.create({
        customerId,
        customer_id: customerId,
        invoiceDate: formattedInvoiceDate,
        invoice_date: formattedInvoiceDate,
        dueDate: formattedDueDate,
        due_date: formattedDueDate,
        items,
        subtotal,
        manualDiscount,
        manual_discount: manualDiscount,
        previousBalance,
        previous_balance: previousBalance,
        totalDiscount,
        total_discount: totalDiscount,
        totalTax,
        total_tax: totalTax,
        charges,
        paid_amount: paidAmount,
        total,
        status,
      });
      navigate('/invoices');
    } catch (error) {
      console.error('Error creating invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Box>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 2,
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}>
          <IconButton onClick={() => navigate('/invoices')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="h1" sx={{ fontWeight: 500 }}>
            Add Invoice
          </Typography>
        </Box>

        <Box sx={{ p: 2 }}>
          <InvoiceHeader
            customers={customers}
            selectedCustomer={selectedCustomer}
            invoiceDate={invoiceDate}
            dueDate={dueDate}
            onCustomerChange={(customer) => {
              setCustomerId(customer?.id || null);
              setSelectedCustomer(customer);
            }}
            onInvoiceDateChange={setInvoiceDate}
            onDueDateChange={setDueDate}
            items={items}
            onItemsChange={setItems}
          />

          <InvoiceItems
            items={items}
            products={products}
            selectedCustomerType={selectedCustomer?.type}
            onItemsChange={setItems}
          />

          <InvoiceFooter
            items={items}
            products={products}
            manualDiscount={manualDiscount}
            previousBalance={previousBalance}
            charges={charges}
            paidAmount={paidAmount}
            onManualDiscountChange={setManualDiscount}
            onPreviousBalanceChange={setPreviousBalance}
            onChargesChange={setCharges}
            onPaidAmountChange={setPaidAmount}
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => handleSave('draft')}
              disabled={loading}
            >
              Save as Draft
            </Button>
            <Button
              variant="contained"
              onClick={() => handleSave('created')}
              disabled={loading}
            >
              Create Invoice
            </Button>
          </Box>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default AddInvoicePage;
