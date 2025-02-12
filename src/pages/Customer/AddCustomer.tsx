import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { api } from '../../services/api';
import AuthLayout from '../../components/Layout/AuthLayout';

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  address: string;
  type: 'wholesale' | 'retail';
}

const AddCustomerPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    type: 'retail',
  });

  useEffect(() => {
    const loadCustomer = async () => {
      if (!id) return;

      try {
        const data = await api.customers.getById(parseInt(id));
        setCustomerData({
          name: data.name,
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          type: data.type,
        });
      } catch (error) {
        console.error('Error loading customer:', error);
        navigate('/customers');
      }
    };

    loadCustomer();
  }, [id, navigate]);

  const handleTextChange = (field: keyof CustomerData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomerData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleTypeChange = (event: SelectChangeEvent<'wholesale' | 'retail'>) => {
    setCustomerData((prev) => ({
      ...prev,
      type: event.target.value as 'wholesale' | 'retail',
    }));
  };

  const handleSubmit = async () => {
    if (!customerData.name) return;

    try {
      setLoading(true);
      if (id) {
        await api.customers.update(parseInt(id), customerData);
      } else {
        await api.customers.create(customerData);
      }
      navigate('/customers');
    } catch (error) {
      console.error('Error saving customer:', error);
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
          <IconButton onClick={() => navigate('/customers')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="h1" sx={{ fontWeight: 500 }}>
            {id ? 'Edit Customer' : 'Add Customer'}
          </Typography>
        </Box>

        <Box sx={{ p: 2 }}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Name"
                  fullWidth
                  required
                  value={customerData.name}
                  onChange={handleTextChange('name')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  value={customerData.email}
                  onChange={handleTextChange('email')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Phone"
                  fullWidth
                  value={customerData.phone}
                  onChange={handleTextChange('phone')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Address"
                  fullWidth
                  multiline
                  rows={3}
                  value={customerData.address}
                  onChange={handleTextChange('address')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="customer-type-label">Type</InputLabel>
                  <Select
                    labelId="customer-type-label"
                    value={customerData.type}
                    label="Type"
                    onChange={handleTypeChange}
                  >
                    <MenuItem value="retail">Retail</MenuItem>
                    <MenuItem value="wholesale">Wholesale</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/customers')}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || !customerData.name}
              >
                {id ? 'Update' : 'Create'}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default AddCustomerPage;
