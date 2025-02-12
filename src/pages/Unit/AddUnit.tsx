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

interface Unit {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

interface AddUnitProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  unit?: Unit | null;
}

const MotionBox = motion(Box);

const AddUnit = ({ isOpen, onClose, onSuccess, unit }: AddUnitProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (unit) {
      setFormData({
        name: unit.name,
        description: unit.description || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
      });
    }
  }, [unit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (unit) {
        await api.units.update(unit.id, formData.name, formData.description);
      } else {
        await api.units.create(formData.name, formData.description);
      }
      onSuccess();
      onClose();
      setFormData({ name: '', description: '' });
    } catch (error) {
      console.error('Error saving unit:', error);
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
        {unit ? 'Edit Unit' : 'Add Unit'}
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
              label="Unit Name"
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
            {unit ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddUnit;
