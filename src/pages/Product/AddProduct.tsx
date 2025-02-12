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
  Paper,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Calculate as CalculateIcon,
} from '@mui/icons-material';

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface Unit {
  id: number;
  name: string;
  description?: string;
}

interface ProductCompany {
  id: number;
  name: string;
  description?: string;
}

interface MultiUnit {
  unitId: number;
  conversionRate: number;
  retailRate: number;
  wholesaleRate: number;
}

interface FormData {
  name: string;
  code: string;
  categoryId: number;
  baseUnitId: number;
  baseRate: number;
  baseWholesaleRate: number;
  hsnCode: string;
  companyId: number;
  taxPercentage: number;
  multiUnits: MultiUnit[];
}

const roundToTwo = (num: number) => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

const AddProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    code: generateProductCode(),
    categoryId: 0,
    baseUnitId: 0,
    baseRate: 0,
    baseWholesaleRate: 0,
    hsnCode: '',
    companyId: 0,
    taxPercentage: 0,
    multiUnits: [],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [companies, setCompanies] = useState<ProductCompany[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, unitsData, companiesData] = await Promise.all([
          api.categories.getAll(),
          api.units.getAll(),
          api.productCompanies.getAll(),
        ]);
        setCategories(categoriesData);
        setUnits(unitsData);
        setCompanies(companiesData);

        if (isEdit) {
          const product = await api.products.getById(Number(id));
          setFormData({
            name: product.name,
            code: product.code,
            categoryId: product.categoryId || 0,
            baseUnitId: product.baseUnitId,
            baseRate: roundToTwo(product.baseRate),
            baseWholesaleRate: roundToTwo(product.baseWholesaleRate || 0),
            hsnCode: product.hsnCode || '',
            companyId: product.companyId || 0,
            taxPercentage: product.taxPercentage || 0,
            multiUnits: product.units?.map(unit => ({
              ...unit,
              retailRate: roundToTwo(unit.retailRate),
              wholesaleRate: roundToTwo(unit.wholesaleRate),
            })) || [],
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [id, isEdit]);

  function generateProductCode() {
    const timestamp = Date.now();
    return timestamp.toString().slice(-10);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.baseUnitId || !formData.baseRate) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        baseRate: roundToTwo(formData.baseRate),
        baseWholesaleRate: roundToTwo(formData.baseWholesaleRate),
        multiUnits: formData.multiUnits.map(unit => ({
          ...unit,
          retailRate: roundToTwo(unit.retailRate),
          wholesaleRate: roundToTwo(unit.wholesaleRate),
        })),
      };

      if (isEdit) {
        await api.products.update(Number(id), dataToSubmit);
      } else {
        await api.products.create(dataToSubmit);
      }
      navigate('/products');
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUnit = () => {
    setFormData(prev => ({
      ...prev,
      multiUnits: [
        ...prev.multiUnits,
        {
          unitId: 0,
          conversionRate: 0,
          retailRate: 0,
          wholesaleRate: 0,
        },
      ],
    }));
  };

  const handleRemoveUnit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      multiUnits: prev.multiUnits.filter((_, i) => i !== index),
    }));
  };

  const handleUnitChange = (index: number, field: keyof MultiUnit, value: number) => {
    setFormData(prev => ({
      ...prev,
      multiUnits: prev.multiUnits.map((unit, i) => {
        if (i === index) {
          const updatedUnit = { ...unit, [field]: value };
          
          // Auto-calculate rates when conversion rate changes
          if (field === 'conversionRate') {
            updatedUnit.retailRate = roundToTwo(prev.baseRate * value);
            updatedUnit.wholesaleRate = roundToTwo(prev.baseWholesaleRate * value);
          }
          
          return updatedUnit;
        }
        return unit;
      }),
    }));
  };

  const recalculateAllRates = () => {
    setFormData(prev => ({
      ...prev,
      multiUnits: prev.multiUnits.map(unit => ({
        ...unit,
        retailRate: roundToTwo(prev.baseRate * unit.conversionRate),
        wholesaleRate: roundToTwo(prev.baseWholesaleRate * unit.conversionRate),
      })),
    }));
  };

  // Update multi-unit rates when base rates change
  useEffect(() => {
    if (formData.multiUnits.length > 0) {
      recalculateAllRates();
    }
  }, [formData.baseRate, formData.baseWholesaleRate]);

  const handleBaseRateChange = (field: 'baseRate' | 'baseWholesaleRate', value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: roundToTwo(value),
    }));
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
          <IconButton size="small" onClick={() => navigate('/products')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            {isEdit ? 'Edit Product' : 'Add Product'}
          </Typography>
        </Box>

        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  size="small"
                  fullWidth
                  label="Product Name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  size="small"
                  fullWidth
                  label="Product Code"
                  required
                  value={formData.code}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  size="small"
                  select
                  fullWidth
                  label="Base Unit"
                  required
                  value={formData.baseUnitId}
                  onChange={(e) => setFormData(prev => ({ ...prev, baseUnitId: Number(e.target.value) }))}
                >
                  <MenuItem value={0}>Select base unit</MenuItem>
                  {units.map((unit) => (
                    <MenuItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  size="small"
                  fullWidth
                  type="number"
                  label="Base Rate"
                  required
                  value={formData.baseRate}
                  onChange={(e) => handleBaseRateChange('baseRate', Number(e.target.value))}
                  inputProps={{ step: "0.01" }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  size="small"
                  select
                  fullWidth
                  label="Category"
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: Number(e.target.value) }))}
                >
                  <MenuItem value={0}>Select category</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  size="small"
                  fullWidth
                  type="number"
                  label="Base Wholesale Rate"
                  value={formData.baseWholesaleRate}
                  onChange={(e) => handleBaseRateChange('baseWholesaleRate', Number(e.target.value))}
                  inputProps={{ step: "0.01" }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  size="small"
                  fullWidth
                  label="HSN Code"
                  value={formData.hsnCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, hsnCode: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  size="small"
                  select
                  fullWidth
                  label="Product Company"
                  value={formData.companyId}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyId: Number(e.target.value) }))}
                >
                  <MenuItem value={0}>Select product company</MenuItem>
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  size="small"
                  fullWidth
                  type="number"
                  label="Tax Percentage"
                  value={formData.taxPercentage}
                  onChange={(e) => setFormData(prev => ({ ...prev, taxPercentage: Number(e.target.value) }))}
                  InputProps={{ endAdornment: '%' }}
                  inputProps={{ step: "0.01" }}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1">Multi Units</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Recalculate all rates">
                    <span>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={recalculateAllRates}
                        disabled={formData.multiUnits.length === 0}
                      >
                        <CalculateIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddUnit}
                  >
                    Add Unit
                  </Button>
                </Box>
              </Box>

              {formData.multiUnits.map((unit, index) => (
                <Paper key={index} elevation={0} sx={{ p: 1.5, mb: 1, border: 1, borderColor: 'divider' }}>
                  <Grid container spacing={1.5} alignItems="center">
                    <Grid item xs={12} sm={2.5}>
                      <TextField
                        size="small"
                        select
                        fullWidth
                        label="Unit"
                        required
                        value={unit.unitId}
                        onChange={(e) => handleUnitChange(index, 'unitId', Number(e.target.value))}
                      >
                        <MenuItem value={0}>Select unit</MenuItem>
                        {units.map((u) => (
                          <MenuItem key={u.id} value={u.id}>
                            {u.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={2.5}>
                      <TextField
                        size="small"
                        fullWidth
                        type="number"
                        label="Conversion Rate"
                        required
                        value={unit.conversionRate}
                        onChange={(e) => handleUnitChange(index, 'conversionRate', Number(e.target.value))}
                        helperText={`1 ${units.find(u => u.id === unit.unitId)?.name || 'unit'} = ${unit.conversionRate} ${units.find(u => u.id === formData.baseUnitId)?.name || 'base unit'}`}
                        inputProps={{ step: "0.01" }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2.5}>
                      <TextField
                        size="small"
                        fullWidth
                        type="number"
                        label="Retail Rate"
                        required
                        value={unit.retailRate}
                        onChange={(e) => handleUnitChange(index, 'retailRate', Number(e.target.value))}
                        inputProps={{ step: "0.01" }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2.5}>
                      <TextField
                        size="small"
                        fullWidth
                        type="number"
                        label="Wholesale Rate"
                        required
                        value={unit.wholesaleRate}
                        onChange={(e) => handleUnitChange(index, 'wholesaleRate', Number(e.target.value))}
                        inputProps={{ step: "0.01" }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <IconButton 
                        size="small"
                        color="error" 
                        onClick={() => handleRemoveUnit(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate('/products')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                size="small"
                type="submit"
                variant="contained"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : isEdit ? 'Update Product' : 'Save Product'}
              </Button>
            </Box>
          </form>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default AddProduct;
