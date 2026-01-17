import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

interface CalloutCompodentProps {
  open: boolean;
  taskNumber: string;
  onClose: () => void;
}

const CalloutCompodent: React.FC<CalloutCompodentProps> = ({ open, taskNumber, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          Task: {taskNumber}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {/* Additional content can go here */}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={onClose}
          startIcon={<CloseRoundedIcon />}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CalloutCompodent;
