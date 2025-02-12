import { Box, Button, IconButton, TextField, Typography, Autocomplete, Grid, Paper } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { calculateItemTotal } from './InvoiceFooter';
import { api } from '../services/api';

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
  productName?: string;
  unitName?: string;
  product_id?: number;
  unit_id?: number;
  product_name?: string;
  unit_name?: string;
  availableUnits?: UnitOption[];
}

interface InvoiceItemsProps {
  items: InvoiceItem[];
  products: Product[];
  selectedCustomerType?: 'wholesale' | 'retail';
  onItemsChange: (items: InvoiceItem[]) => void;
}

const InvoiceItems = ({
  items,
  products,
  selectedCustomerType,
  onItemsChange,
}: InvoiceItemsProps) => {
  const handleAddItem = () => {
    onItemsChange([
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
    onItemsChange(items.filter((_, i) => i !== index));
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
      item.rate = selectedCustomerType === 'wholesale' && product.baseWholesaleRate !== null
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
        ...(product.units?.map((unit: ProductUnit) => ({
          unitId: unit.unitId,
          conversionRate: unit.conversionRate,
          retailRate: unit.retailRate,
          wholesaleRate: unit.wholesaleRate,
          unit_name: unit.unit_name || '',
        })) || []),
      ];

      item.total = calculateItemTotal(item.quantity, item.rate, item.discount);

      newItems[index] = item;
      onItemsChange(newItems);
    } catch (error) {
      console.error('Error loading product details:', error);
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };

    if (field === 'unitId') {
      const selectedUnit = item.availableUnits?.find(u => u.unitId === value);
      if (selectedUnit) {
        item.rate = selectedCustomerType === 'wholesale'
          ? selectedUnit.wholesaleRate
          : selectedUnit.retailRate;
        item.unitName = selectedUnit.unit_name;
      }
    }

    if (field === 'quantity' || field === 'rate' || field === 'discount') {
      item.total = calculateItemTotal(
        field === 'quantity' ? value : item.quantity,
        field === 'rate' ? value : item.rate,
        field === 'discount' ? value : item.discount
      );
    }

    newItems[index] = item;
    onItemsChange(newItems);
  };

  return (
    <Paper sx={{ mt: 1, p: 1 }}>
      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Products</Typography>
        <Button 
          size="small" 
          variant="contained" 
          onClick={handleAddItem}
          startIcon={<AddIcon />}
        >
          Add
        </Button>
      </Box>

      {items.map((item, index) => (
        <Grid container key={index} spacing={1} sx={{ mb: 1 }}>
          <Grid item xs={12} md={3.5}>
            <Autocomplete
              size="small"
              options={products}
              value={products.find(p => p.id === item.productId) || null}
              getOptionLabel={(option) => `${option.name} (${option.code})`}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Product" 
                  required 
                  size="small"
                  InputLabelProps={{ 
                    sx: { fontSize: '0.875rem' } 
                  }}
                />
              )}
              onChange={(_, value) => {
                if (value) {
                  handleProductSelect(index, value.id);
                }
              }}
              ListboxProps={{
                style: { fontSize: '0.875rem' }
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Autocomplete
              size="small"
              options={item.availableUnits?.filter((u): u is NonNullable<typeof u> => u !== null) || []}
              getOptionLabel={(option) => option.unit_name || ''}
              value={item.availableUnits?.find(u => u && u.unitId === item.unitId) || null}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Unit" 
                  required 
                  size="small"
                  InputLabelProps={{ 
                    sx: { fontSize: '0.875rem' } 
                  }}
                />
              )}
              onChange={(_, value) => {
                handleItemChange(index, 'unitId', value?.unitId || 0);
              }}
              ListboxProps={{
                style: { fontSize: '0.875rem' }
              }}
            />
          </Grid>
          <Grid item xs={12} md={1.5}>
            <TextField
              size="small"
              label="Quantity"
              type="number"
              fullWidth
              required
              value={item.quantity || 0}
              onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
              InputLabelProps={{ 
                sx: { fontSize: '0.875rem' } 
              }}
              inputProps={{
                style: { fontSize: '0.875rem' }
              }}
            />
          </Grid>
          <Grid item xs={12} md={1.5}>
            <TextField
              size="small"
              label="Rate"
              type="number"
              fullWidth
              required
              value={item.rate || 0}
              onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
              InputLabelProps={{ 
                sx: { fontSize: '0.875rem' } 
              }}
              inputProps={{
                style: { fontSize: '0.875rem' }
              }}
            />
          </Grid>
          <Grid item xs={12} md={1}>
            <TextField
              size="small"
              label="Disc %"
              type="number"
              fullWidth
              value={item.discount || 0}
              onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value) || 0)}
              InputLabelProps={{ 
                sx: { fontSize: '0.875rem' } 
              }}
              inputProps={{
                style: { fontSize: '0.875rem' }
              }}
            />
          </Grid>
          <Grid item xs={12} md={1.5}>
            <TextField
              size="small"
              label="Total"
              type="number"
              fullWidth
              disabled
              value={(item.total || 0).toFixed(2)}
              InputLabelProps={{ 
                sx: { fontSize: '0.875rem' } 
              }}
              inputProps={{
                style: { fontSize: '0.875rem' }
              }}
            />
          </Grid>
          <Grid item xs={12} md={1} sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              size="small" 
              color="error" 
              onClick={() => handleRemoveItem(index)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Grid>
        </Grid>
      ))}
    </Paper>
  );
};

export default InvoiceItems;
