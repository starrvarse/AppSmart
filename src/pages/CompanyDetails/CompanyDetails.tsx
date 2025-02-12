import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  IconButton,
  Avatar,
  Alert,
  Snackbar,
} from '@mui/material';
import { PhotoCamera as PhotoCameraIcon, Edit as EditIcon } from '@mui/icons-material';
import { api } from '../../services/api';
import AuthLayout from '../../components/Layout/AuthLayout';

const CompanyDetails = () => {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [company, setCompany] = useState<{
    name: string;
    address: string;
    gst: string;
    phone: string;
    email: string;
    logo: string | undefined;
  }>({
    name: '',
    address: '',
    gst: '',
    phone: '',
    email: '',
    logo: undefined,
  });

  useEffect(() => {
    const loadCompany = async () => {
      try {
        const data = await api.company.get();
        setCompany({
          name: data.name || '',
          address: data.address || '',
          gst: data.gst || '',
          phone: data.phone || '',
          email: data.email || '',
          logo: data.logo || '',
        });
      } catch (error) {
        console.error('Error loading company:', error);
        setError('Failed to load company details');
      }
    };
    loadCompany();
  }, []);

  const handleChange = (field: keyof typeof company) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCompany((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('Logo size should be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setCompany((prev) => ({
          ...prev,
          logo: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!company.name.trim()) {
      setError('Company name is required');
      return false;
    }
    if (company.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(company.email)) {
      setError('Invalid email address');
      return false;
    }
    if (company.phone && !/^[+]?[\d\s-]{10,}$/.test(company.phone)) {
      setError('Invalid phone number');
      return false;
    }
    if (company.gst && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(company.gst)) {
      setError('Invalid GST number format');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);
      const response = await api.company.update(company);
      if (response.logo) {
        setCompany(prev => ({ ...prev, logo: response.logo }));
      }
      setShowSuccess(true);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error updating company:', error);
      setError('Failed to update company details');
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
          justifyContent: 'space-between',
          gap: 2,
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}>
          <Typography variant="h6" component="h1" sx={{ fontWeight: 500 }}>
            Company Details
          </Typography>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setIsEditMode(!isEditMode)}
            color={isEditMode ? "error" : "primary"}
          >
            {isEditMode ? "Cancel" : "Edit"}
          </Button>
        </Box>

        <Box sx={{ p: 2 }}>
          <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={company.logo?.startsWith('data:') ? company.logo : company.logo ? `${company.logo}?${Date.now()}` : undefined}
                    variant="rounded"
                    sx={{
                      width: 150,
                      height: 150,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                    }}
                  />
                  {isEditMode && (
                    <>
                      <input
                        accept="image/*"
                        type="file"
                        id="logo-input"
                        onChange={handleLogoChange}
                        style={{ display: 'none' }}
                        aria-label="Upload company logo"
                        title="Upload company logo"
                      />
                      <label htmlFor="logo-input" aria-label="Upload company logo">
                        <IconButton
                          component="span"
                          sx={{
                            position: 'absolute',
                            right: -10,
                            bottom: -10,
                            bgcolor: 'background.paper',
                            boxShadow: 1,
                            '&:hover': {
                              bgcolor: 'background.paper',
                            },
                          }}
                        >
                          <PhotoCameraIcon />
                        </IconButton>
                      </label>
                    </>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Company Name"
                  fullWidth
                  value={company.name}
                  onChange={handleChange('name')}
                  required
                  error={isEditMode && !company.name.trim()}
                  helperText={isEditMode && !company.name.trim() ? 'Company name is required' : ''}
                  disabled={!isEditMode}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Address"
                  fullWidth
                  multiline
                  rows={3}
                  value={company.address}
                  onChange={handleChange('address')}
                  disabled={!isEditMode}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="GST Number"
                  fullWidth
                  value={company.gst}
                  onChange={handleChange('gst')}
                  placeholder="22AAAAA0000A1Z5"
                  helperText="Format: 22AAAAA0000A1Z5"
                  disabled={!isEditMode}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Phone"
                  fullWidth
                  value={company.phone}
                  onChange={handleChange('phone')}
                  type="tel"
                  placeholder="+91 1234567890"
                  disabled={!isEditMode}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  value={company.email}
                  onChange={handleChange('email')}
                  placeholder="company@example.com"
                  disabled={!isEditMode}
                />
              </Grid>

              {isEditMode && (
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    size="large"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Box>
      </Box>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setShowSuccess(false)}>
          Company details saved successfully
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </AuthLayout>
  );
};

export default CompanyDetails;
