import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  Autocomplete,
  Grid,
  Paper,
} from '@mui/material';
import { Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { api } from '../../services/api';
import AuthLayout from '../../components/Layout/AuthLayout';

interface Customer {
  id: number;
  name: string;
  phone?: string;
  type: 'wholesale' | 'retail';
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
  baseRate: number;
  baseWholesaleRate: number | null;
  taxPercentage: number;
  baseUnitId: number;
  base_unit_name?: string;
  units?: ProductUnit[];
}

interface InvoiceItem {
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
  availableUnits?: Array<{
    unitId: number;
    conversionRate: number;
    retailRate: number;
    wholesaleRate: number;
    unit_name: string;
  } | null>;
}

const calculateItemTotal = (quantity: number, rate: number, discount: number) => {
  const subtotal = (quantity || 0) * (rate || 0);
  return subtotal * (1 - (discount || 0) / 100);
};

const EditInvoicePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [originalInvoice, setOriginalInvoice] = useState<any | null>(null);

  const [customerId, setCustomerId] = useState<number | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [invoiceDate, setInvoiceDate] = useState<Date | null>(new Date());
  const [dueDate, setDueDate] = useState<Date | null>(new Date());
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [manualDiscount, setManualDiscount] = useState(0);
  const [schemeDiscount, setSchemeDiscount] = useState(0);

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
          setSchemeDiscount(invoiceData.schemeDiscount || invoiceData.scheme_discount || 0);

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

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        productId: 0,
        unitId: 0,
        quantity: 1,
        rate: 0,
        discount: 0,
        total: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleProductSelect = async (index: number, productId: number) => {
    try {
      const product = await api.products.getById(productId);
      const newItems = [...items];
      const item = { ...newItems[index] };

      item.productId = product.id;
      item.productName = product.name;
      item.unitId = product.baseUnitId;
      item.unitName = product.base_unit_name || '';
      // Use wholesale rate if customer is wholesale type
      item.rate = selectedCustomer?.type === 'wholesale' && product.baseWholesaleRate !== null
        ? product.baseWholesaleRate
        : product.baseRate;

      item.availableUnits = [
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
        })) || []),
      ];

      // Recalculate total
      item.total = calculateItemTotal(item.quantity, item.rate, item.discount);

      newItems[index] = item;
      setItems(newItems);
    } catch (error) {
      console.error('Error loading product details:', error);
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };

    // If unit changes, update the rate based on the product's unit rates
    if (field === 'unitId') {
      const selectedUnit = item.availableUnits?.find(u => u && u.unitId === value);
      if (selectedUnit && selectedUnit !== null) {
        // Use wholesale rate if customer is wholesale type
        item.rate = selectedCustomer?.type === 'wholesale'
          ? selectedUnit.wholesaleRate
          : selectedUnit.retailRate;
        item.unitName = selectedUnit.unit_name || '';
      }
    }

    // Recalculate total when quantity, rate, or discount changes
    if (field === 'quantity' || field === 'rate' || field === 'discount') {
      item.total = calculateItemTotal(
        field === 'quantity' ? value : item.quantity,
        field === 'rate' ? value : item.rate,
        field === 'discount' ? value : item.discount
      );
    }

    newItems[index] = item;
    setItems(newItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = calculateItemTotal(item.quantity, item.rate, item.discount);
      return sum + itemTotal;
    }, 0);

    const totalDiscount = (manualDiscount || 0) + (schemeDiscount || 0);

    const totalTax = items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      const itemTotal = calculateItemTotal(item.quantity, item.rate, item.discount);
      return sum + (itemTotal * (product?.taxPercentage || 0) / 100);
    }, 0);

    const total = subtotal - totalDiscount + totalTax;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      totalDiscount: Number(totalDiscount.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2)),
      total: Number(total.toFixed(2))
    };
  };

  const handleSave = async () => {
    if (!customerId || !invoiceDate || !dueDate || !id || !originalInvoice) return;

    const { subtotal, totalDiscount, totalTax, total } = calculateTotals();

    try {
      setLoading(true);
      const formattedInvoiceDate = dayjs(invoiceDate).format('YYYY-MM-DD');
      const formattedDueDate = dayjs(dueDate).format('YYYY-MM-DD');

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
        schemeDiscount,
        scheme_discount: schemeDiscount,
        totalDiscount,
        total_discount: totalDiscount,
        totalTax,
        total_tax: totalTax,
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
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={customers}
                value={selectedCustomer}
                getOptionLabel={(option) => `${option.name} (${option.type})`}
                renderInput={(params) => (
                  <TextField {...params} label="Customer" required />
                )}
                onChange={(_, value) => {
                  setCustomerId(value?.id || null);
                  setSelectedCustomer(value);
                  // Update rates for all items based on customer type
                  if (value) {
                    const newItems = items.map(item => {
                      const newItem = { ...item };
                      if (item.availableUnits && item.unitId) {
                        const selectedUnit = item.availableUnits.find(u => u && u.unitId === item.unitId);
                        if (selectedUnit) {
                          newItem.rate = value.type === 'wholesale'
                            ? selectedUnit.wholesaleRate
                            : selectedUnit.retailRate;
                          newItem.total = calculateItemTotal(newItem.quantity, newItem.rate, newItem.discount);
                        }
                      }
                      return newItem;
                    });
                    setItems(newItems);
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <DatePicker
                label="Invoice Date"
                value={dayjs(invoiceDate)}
                onChange={(value) => setInvoiceDate(value?.toDate() || null)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <DatePicker
                label="Due Date"
                value={dayjs(dueDate)}
                onChange={(value) => setDueDate(value?.toDate() || null)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </Grid>
          </Grid>

          <Paper sx={{ mt: 3, p: 2 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Products</Typography>
              <Button variant="contained" onClick={handleAddItem}>
                Add Product
              </Button>
            </Box>

            {items.map((item, index) => (
              <Grid container key={index} spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={3}>
                  <Autocomplete
                    options={products}
                    value={products.find(p => p.id === item.productId) || null}
                    getOptionLabel={(option) => `${option.name} (${option.code})`}
                    renderInput={(params) => (
                      <TextField {...params} label="Product" required />
                    )}
                    onChange={(_, value) => {
                      if (value) {
                        handleProductSelect(index, value.id);
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Autocomplete
                    options={item.availableUnits?.filter((u): u is NonNullable<typeof u> => u !== null) || []}
                    getOptionLabel={(option) => option.unit_name || ''}
                    value={item.availableUnits?.find(u => u && u.unitId === item.unitId) || null}
                    renderInput={(params) => (
                      <TextField {...params} label="Unit" required />
                    )}
                    onChange={(_, value) => {
                      handleItemChange(index, 'unitId', value?.unitId || 0);
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={1}>
                  <TextField
                    label="Quantity"
                    type="number"
                    fullWidth
                    required
                    value={item.quantity || 0}
                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    label="Rate"
                    type="number"
                    fullWidth
                    required
                    value={item.rate || 0}
                    onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                  />
                </Grid>
                <Grid item xs={12} md={1}>
                  <TextField
                    label="Discount %"
                    type="number"
                    fullWidth
                    value={item.discount || 0}
                    onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value) || 0)}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    label="Total"
                    type="number"
                    fullWidth
                    disabled
                    value={(item.total || 0).toFixed(2)}
                  />
                </Grid>
                <Grid item xs={12} md={1}>
                  <IconButton color="error" onClick={() => handleRemoveItem(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
          </Paper>

          <Paper sx={{ mt: 3, p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Manual Discount"
                  type="number"
                  fullWidth
                  value={manualDiscount || 0}
                  onChange={(e) => setManualDiscount(parseFloat(e.target.value) || 0)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Scheme Discount"
                  type="number"
                  fullWidth
                  value={schemeDiscount || 0}
                  onChange={(e) => setSchemeDiscount(parseFloat(e.target.value) || 0)}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Typography>Subtotal: ₹{calculateTotals().subtotal.toFixed(2)}</Typography>
              <Typography>Total Discount: ₹{calculateTotals().totalDiscount.toFixed(2)}</Typography>
              <Typography>Total Tax: ₹{calculateTotals().totalTax.toFixed(2)}</Typography>
              <Typography variant="h6">Total: ₹{calculateTotals().total.toFixed(2)}</Typography>
            </Box>
          </Paper>

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
