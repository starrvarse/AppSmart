import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import AuthLayout from '../../components/Layout/AuthLayout';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Autocomplete,
  Chip,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

interface FormData {
  name: string;
  type: 'category' | 'product';
  discountType: 'percentage' | 'flat' | 'buy_x_get_y';
  discountValue: number | null;
  buyQuantity: number | null;
  freeQuantity: number | null;
  startDate: Date;
  endDate: Date;
  categories: number[];
  products: Array<{
    id: number;
    unitId: number;
    quantity: number;
  }>;
}

const AddScheme = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: 'category',
    discountType: 'percentage',
    discountValue: null,
    buyQuantity: null,
    freeQuantity: null,
    startDate: new Date(),
    endDate: new Date(),
    categories: [],
    products: [] as Array<{ id: number; unitId: number; quantity: number }>,
  });

  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [products, setProducts] = useState<Array<{
    id: number;
    name: string;
    code: string;
    categoryId: number;
    baseUnitId: number;
    baseRate: number;
    baseWholesaleRate: number | null;
    purchaseRate?: number;
    hsnCode?: string;
    companyId: number;
    taxPercentage: number;
    base_unit_name?: string;
  }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isEdit) {
      loadScheme();
    }
  }, [id]);

  const loadData = async () => {
    try {
      const [categoriesData, productsData] = await Promise.all([
        api.categories.getAll(),
        api.products.getAll(),
      ]);
      setCategories(categoriesData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadScheme = async () => {
    try {
      const scheme = await api.schemes.getById(Number(id));
      setFormData({
        name: scheme.name,
        type: scheme.type,
        discountType: scheme.discountType,
        discountValue: scheme.discountValue,
        buyQuantity: scheme.buyQuantity,
        freeQuantity: scheme.freeQuantity,
        startDate: new Date(scheme.startDate),
        endDate: new Date(scheme.endDate),
        categories: scheme.categories?.map(c => c.id) || [],
        products: scheme.products?.map(p => ({
          id: p.id,
          unitId: p.unitId || 0,
          quantity: p.quantity || 1
        })) || [],
      });
    } catch (error) {
      console.error('Error loading scheme:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const data = {
        name: formData.name,
        type: formData.type,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        buyQuantity: formData.buyQuantity,
        freeQuantity: formData.freeQuantity,
        startDate: formData.startDate.toISOString().split('T')[0],
        endDate: formData.endDate.toISOString().split('T')[0],
        categories: formData.type === 'category' ? formData.categories.map(id => ({
          id,
          name: categories.find(c => c.id === id)?.name || ''
        })) : [],
        products: formData.type === 'product' ? formData.products.map(product => {
          const productData = products.find(p => p.id === product.id);
          return {
            id: product.id,
            name: productData?.name || '',
            code: productData?.code || '',
            unitId: product.unitId,
            unit_name: productData?.base_unit_name || '',
            quantity: product.quantity
          };
        }) : []
      };

      if (isEdit) {
        await api.schemes.update(Number(id), data);
      } else {
        await api.schemes.create(data);
      }
      navigate('/schemes');
    } catch (error) {
      console.error('Error saving scheme:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.name) {
      alert('Please enter scheme name');
      return false;
    }

    if (formData.type === 'category' && formData.categories.length === 0) {
      alert('Please select at least one category');
      return false;
    }

    if (formData.type === 'product' && formData.products.length === 0) {
      alert('Please select at least one product');
      return false;
    }

    if (formData.discountType !== 'buy_x_get_y' && !formData.discountValue) {
      alert('Please enter discount value');
      return false;
    }

    if (formData.discountType === 'buy_x_get_y' && (!formData.buyQuantity || !formData.freeQuantity)) {
      alert('Please enter buy and free quantities');
      return false;
    }

    return true;
  };

  return (
    <AuthLayout>
      <Box>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}>
          <IconButton size="small" onClick={() => navigate('/schemes')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            {isEdit ? 'Edit Scheme' : 'Add Scheme'}
          </Typography>
        </Box>

        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Scheme Name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Type"
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      type: e.target.value as 'category' | 'product',
                      categories: [],
                      products: [],
                    }))}
                  >
                    <MenuItem value="category">Category</MenuItem>
                    <MenuItem value="product">Product</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Discount Type</InputLabel>
                  <Select
                    value={formData.discountType}
                    label="Discount Type"
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      discountType: e.target.value as 'percentage' | 'flat' | 'buy_x_get_y',
                      discountValue: null,
                      buyQuantity: null,
                      freeQuantity: null,
                    }))}
                  >
                    <MenuItem value="percentage">Percentage</MenuItem>
                    <MenuItem value="flat">Flat Amount</MenuItem>
                    <MenuItem value="buy_x_get_y">Buy X Get Y Free</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {formData.discountType !== 'buy_x_get_y' ? (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label={formData.discountType === 'percentage' ? 'Percentage' : 'Amount'}
                    required
                    value={formData.discountValue || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      discountValue: e.target.value ? Number(e.target.value) : null 
                    }))}
                    InputProps={{
                      endAdornment: formData.discountType === 'percentage' ? '%' : '₹',
                    }}
                  />
                </Grid>
              ) : (
                <>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Buy Quantity"
                      required
                      value={formData.buyQuantity || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        buyQuantity: e.target.value ? Number(e.target.value) : null 
                      }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Free Quantity"
                      required
                      value={formData.freeQuantity || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        freeQuantity: e.target.value ? Number(e.target.value) : null 
                      }))}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={formData.startDate}
                    onChange={(date) => date && setFormData(prev => ({ ...prev, startDate: date }))}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={formData.endDate}
                    onChange={(date) => date && setFormData(prev => ({ ...prev, endDate: date }))}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12}>
                {formData.type === 'category' ? (
                  <FormControl fullWidth size="small">
                    <InputLabel>Categories</InputLabel>
                    <Select
                      multiple
                      value={formData.categories}
                      label="Categories"
                      onChange={(e) => {
                        const selectedIds = e.target.value as number[];
                        setFormData(prev => ({
                          ...prev,
                          categories: selectedIds,
                        }));
                      }}
                    >
                      {categories.map(category => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      Select one or more categories
                    </FormHelperText>
                  </FormControl>
                ) : (
                  <Autocomplete
                    multiple
                    size="small"
                    options={products}
                    value={products.filter(product => 
                      formData.products.some(p => p.id === product.id)
                    )}
                    getOptionLabel={(option) => `${option.name} (${option.code})`}
                    onChange={async (_, newValue) => {
                      const selectedIds = newValue.map(product => product.id);
                      setFormData(prev => ({
                        ...prev,
                        products: selectedIds.map(id => {
                          const existingProduct = prev.products.find(p => p.id === id);
                          const product = products.find(p => p.id === id);
                          return existingProduct || {
                            id,
                            unitId: product?.baseUnitId || 0,
                            quantity: 1
                          };
                        })
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Products"
                        placeholder="Search products..."
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => {
                        const { key, ...chipProps } = getTagProps({ index });
                        return (
                          <Chip
                            key={key}
                            label={`${option.name} (${option.code})`}
                            size="small"
                            sx={{ 
                              '& .MuiChip-label': { 
                                fontSize: '0.75rem',
                                lineHeight: '1.2'
                              }
                            }}
                            {...chipProps}
                          />
                        );
                      })
                    }
                    filterOptions={(options, { inputValue }) => {
                      const searchText = inputValue.toLowerCase();
                      return options.filter(option => 
                        option.name.toLowerCase().includes(searchText) ||
                        option.code.toLowerCase().includes(searchText)
                      );
                    }}
                  />
                )}
                  
                {formData.type === 'product' && formData.products.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Product Details
                    </Typography>
                    {formData.products.map((product, index) => {
                      const productData = products.find(p => p.id === product.id);
                      return (
                        <Box key={product.id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                {productData?.name} ({productData?.base_unit_name})
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Quantity"
                                value={product.quantity}
                                onChange={(e) => {
                                  const newProducts = [...formData.products];
                                  newProducts[index].quantity = Number(e.target.value);
                                  setFormData(prev => ({
                                    ...prev,
                                    products: newProducts
                                  }));
                                }}
                                inputProps={{ min: "1", step: "1" }}
                              />
                            </Grid>
                          </Grid>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 3 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate('/schemes')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                size="small"
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Saving...' : isEdit ? 'Update Scheme' : 'Save Scheme'}
              </Button>
            </Box>
          </form>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default AddScheme;
