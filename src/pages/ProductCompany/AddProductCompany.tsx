import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Save as SaveIcon, Close as CloseIcon } from '@mui/icons-material';

interface ProductCompany {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

interface AddProductCompanyProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  company?: ProductCompany | null;
}

const MotionBox = motion(Box);

const AddProductCompany = ({ isOpen, onClose, onSuccess, company }: AddProductCompanyProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        description: company.description || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
      });
    }
  }, [company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (company) {
        await api.productCompanies.update(company.id, formData.name, formData.description);
      } else {
        await api.productCompanies.create(formData.name, formData.description);
      }
      onSuccess();
      onClose();
      setFormData({ name: '', description: '' });
    } catch (error) {
      console.error('Error saving product company:', error);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        component: motion.div,
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.2 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        {company ? 'Edit Product Company' : 'Add Product Company'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <MotionBox
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            sx={{ mb: 2 }}
          >
            <TextField
              autoFocus
              label="Company Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </MotionBox>
          <MotionBox
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </MotionBox>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={onClose}
            startIcon={<CloseIcon />}
            component={motion.button}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            component={motion.button}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {company ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddProductCompany;
