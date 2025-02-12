import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import InvoiceFooter, { calculateItemTotal, calculateTotals } from '../../components/InvoiceFooter';
import InvoiceHeader from '../../components/InvoiceHeader';
import InvoiceItems from '../../components/InvoiceItems';
import { Customer, Product, InvoiceItem, Invoice } from '../../types/invoice';

const EditInvoicePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [originalInvoice, setOriginalInvoice] = useState<Invoice | null>(null);

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

        // Load invoice data
        if (id) {
          const invoiceData = await api.invoices.getById(parseInt(id));
          setOriginalInvoice(invoiceData);
          
          // Populate form with existing data
          setCustomerId(invoiceData.customerId || invoiceData.customer_id);
          const customer = customersData.find(c => c.id === (invoiceData.customerId || invoiceData.customer_id));
          setSelectedCustomer(customer || null);
          setInvoiceDate(new Date(invoiceData.invoiceDate || invoiceData.invoice_date));
          setDueDate(new Date(invoiceData.dueDate || invoiceData.due_date));
          setManualDiscount(invoiceData.manualDiscount || invoiceData.manual_discount || 0);
          setPreviousBalance(invoiceData.previousBalance || invoiceData.previous_balance || 0);
          setCharges(invoiceData.charges || 0);
          setPaidAmount(invoiceData.paid_amount || 0);

          // Load items with product details
          if (invoiceData.items) {
            const itemsWithDetails = await Promise.all(
              invoiceData.items.map(async (item: InvoiceItem) => {
                const product = await api.products.getById(item.product_id || item.productId);
                const availableUnits = product ? [
                  {
                    unitId: product.baseUnitId,
                    conversionRate: 1,
                    retailRate: product.baseRate,
                    wholesaleRate: product.baseWholesaleRate || product.baseRate,
                    unit_name: product.base_unit_name || '',
                  },
                  ...(product.units?.map(unit => ({
                    unitId: unit.unitId,
                    conversionRate: unit.conversionRate,
                    retailRate: unit.retailRate,
                    wholesaleRate: unit.wholesaleRate,
                    unit_name: unit.unit_name || '',
                  })) || [])
                ] : [];

                const quantity = item.quantity || 0;
                const rate = item.rate || 0;
                const discount = item.discount || 0;

                return {
                  productId: item.product_id || item.productId,
                  unitId: item.unit_id || item.unitId,
                  quantity,
                  rate,
                  discount,
                  total: calculateItemTotal(quantity, rate, discount),
                  productName: item.product_name || product?.name || '',
                  unitName: item.unit_name || '',
                  availableUnits: availableUnits,
                };
              })
            );
            setItems(itemsWithDetails);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, [id]);

  const handleSave = async () => {
    if (!customerId || !invoiceDate || !dueDate || !id || !originalInvoice) return;

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
      await api.invoices.update(parseInt(id), {
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
        status: originalInvoice.status,
      });
      navigate('/invoices');
    } catch (error) {
      console.error('Error updating invoice:', error);
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
            Edit Invoice
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
              variant="contained"
              onClick={handleSave}
              disabled={loading}
            >
              Update Invoice
            </Button>
          </Box>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default EditInvoicePage;
