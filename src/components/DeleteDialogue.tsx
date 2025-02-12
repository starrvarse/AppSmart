import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Slide } from '@mui/material';
import { Warning as WarningIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { TransitionProps } from '@mui/material/transitions';
import React from 'react';

interface DeleteDialogueProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const DeleteDialogue = ({ isOpen, onClose, onConfirm, itemName }: DeleteDialogueProps) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      TransitionComponent={Transition}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <MotionBox
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <MotionBox
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <WarningIcon color="warning" fontSize="large" />
          </MotionBox>
          <span>Confirm Delete</span>
        </MotionBox>
      </DialogTitle>
      <DialogContent>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          sx={{ typography: 'body1', color: 'text.secondary' }}
        >
          Are you sure you want to delete {itemName}? This action cannot be undone.
        </MotionBox>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <MotionButton
          onClick={onClose}
          variant="outlined"
          color="inherit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Cancel
        </MotionButton>
        <MotionButton
          onClick={onConfirm}
          variant="contained"
          color="error"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          startIcon={
            <MotionBox
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, -20, 20, -20, 20, 0] }}
              transition={{ duration: 0.5, delay: 0.2 }}
              display="flex"
              alignItems="center"
            >
              <DeleteIcon />
            </MotionBox>
          }
        >
          Delete
        </MotionButton>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialogue;
