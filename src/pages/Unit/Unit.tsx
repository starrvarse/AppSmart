import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import AuthLayout from '../../components/Layout/AuthLayout';
import AddUnit from './AddUnit';
import DeleteDialogue from '../../components/DeleteDialogue';
import { DataTable } from '../../components/DataTable';
import { createColumnHelper } from '@tanstack/react-table';
import { Box, Button, Paper, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface Unit {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

const MotionPaper = motion(Paper);
const MotionButton = motion(Button);

const UnitPage = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isDeleteDialogueOpen, setIsDeleteDialogueOpen] = useState(false);

  const loadUnits = async () => {
    try {
      const data = await api.units.getAll();
      setUnits(data);
    } catch (error) {
      console.error('Error loading units:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUnits();
  }, []);

  const handleDelete = async () => {
    if (selectedUnit) {
      try {
        await api.units.delete(selectedUnit.id);
        loadUnits();
        setIsDeleteDialogueOpen(false);
        setSelectedUnit(null);
      } catch (error) {
        console.error('Error deleting unit:', error);
      }
    }
  };

  const handleEdit = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsAddModalOpen(true);
  };

  const columnHelper = createColumnHelper<Unit>();

  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('description', {
      header: 'Description',
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor('created_at', {
      header: 'Created At',
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <MotionButton
            onClick={() => handleEdit(info.row.original)}
            color="primary"
            size="small"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ✏️
          </MotionButton>
          <MotionButton
            onClick={() => {
              setSelectedUnit(info.row.original);
              setIsDeleteDialogueOpen(true);
            }}
            color="error"
            size="small"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🗑️
          </MotionButton>
        </Box>
      ),
    }),
  ];

  return (
    <AuthLayout>
      <Box sx={{ p: 3 }}>
        <MotionPaper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          elevation={2}
          sx={{ borderRadius: 2 }}
        >
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" component="h1" sx={{ fontWeight: 500 }}>
              Units
            </Typography>
            <MotionButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedUnit(null);
                setIsAddModalOpen(true);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Add Unit
            </MotionButton>
          </Box>

          <Box sx={{ p: 2 }}>
            {isLoading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">Loading...</Typography>
              </Box>
            ) : (
              <DataTable data={units} columns={columns} />
            )}
          </Box>
        </MotionPaper>
      </Box>

      <AddUnit
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedUnit(null);
        }}
        onSuccess={loadUnits}
        unit={selectedUnit}
      />

      <DeleteDialogue
        isOpen={isDeleteDialogueOpen}
        onClose={() => {
          setIsDeleteDialogueOpen(false);
          setSelectedUnit(null);
        }}
        onConfirm={handleDelete}
        itemName={selectedUnit?.name || ''}
      />
    </AuthLayout>
  );
};

export default UnitPage;
