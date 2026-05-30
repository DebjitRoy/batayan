import { Box, Paper, Typography, Slider, IconButton, ClickAwayListener } from '@mui/material';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import { useState } from 'react';

interface FontSizeControllerProps {
  fontSize: number;
  onChange: (value: number) => void;
}

export default function FontSizeController({ fontSize, onChange }: FontSizeControllerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClickAway = () => {
    setIsExpanded(false);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Paper
        elevation={6}
        sx={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          p: { xs: isExpanded ? 1 : 0.5, md: 1 },
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'var(--batayan-card)',
          color: 'var(--batayan-text)',
          borderRadius: 3,
          boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
          transition: 'all 0.3s ease'
        }}
      >
      {/* Mobile: compact button, expands on click */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
        {isExpanded ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 0.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 12 }}>S</Typography>
            <Slider
              value={fontSize}
              min={14}
              max={22}
              step={1}
              onChange={(_, value) => onChange(Array.isArray(value) ? value[0] : value)}
              valueLabelDisplay="auto"
              size="small"
              sx={{ width: 120 }}
            />
            <Typography sx={{ fontWeight: 700, fontSize: 12 }}>L</Typography>
          </Box>
        ) : (
          <IconButton
            onClick={() => setIsExpanded(true)}
            size="small"
            sx={{ color: 'inherit' }}
          >
            <TextFieldsIcon sx={{ fontSize: 20 }} />
          </IconButton>
        )}
      </Box>

      {/* Desktop: always show full slider */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, px: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 12 }}>S</Typography>
        <Slider
          value={fontSize}
          min={14}
          max={22}
          step={1}
          onChange={(_, value) => onChange(Array.isArray(value) ? value[0] : value)}
          valueLabelDisplay="auto"
          size="small"
          sx={{ width: 140 }}
        />
        <Typography sx={{ fontWeight: 700, fontSize: 12 }}>L</Typography>
      </Box>
    </Paper>
    </ClickAwayListener>
  );
}
