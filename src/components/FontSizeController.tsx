import { Box, IconButton, Paper, Typography } from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';

interface FontSizeControllerProps {
  fontSize: number;
  onChange: (value: number) => void;
}

export default function FontSizeController({ fontSize, onChange }: FontSizeControllerProps) {
  return (
    <Paper
      elevation={6}
      sx={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        p: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: 'var(--batayan-card)',
        color: 'var(--batayan-text)',
        borderRadius: 3,
        boxShadow: '0 12px 30px rgba(0,0,0,0.12)'
      }}
    >
      <IconButton onClick={() => onChange(Math.max(14, fontSize - 1))} size="small">
        <RemoveIcon />
      </IconButton>
      <Typography>{fontSize}px</Typography>
      <IconButton onClick={() => onChange(Math.min(22, fontSize + 1))} size="small">
        <AddIcon />
      </IconButton>
    </Paper>
  );
}
