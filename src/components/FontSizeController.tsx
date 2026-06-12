import { keyframes } from '@emotion/react';
import { Box, Paper, Typography, Slider, IconButton, ClickAwayListener } from '@mui/material';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import { useEffect, useRef, useState } from 'react';
import { useMobileFeatureHint } from '../contexts/MobileFeatureHintContext';

const pulseOutline = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(196, 159, 120, 0.14); }
  50% { box-shadow: 0 0 0 10px rgba(196, 159, 120, 0.08); }
`;

interface FontSizeControllerProps {
  fontSize: number;
  onChange: (value: number) => void;
}

export default function FontSizeController({ fontSize, onChange }: FontSizeControllerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sliderValue, setSliderValue] = useState(fontSize);
  const isSlidingRef = useRef(false);
  const sliderValueRef = useRef(fontSize);

  useEffect(() => {
    if (isSlidingRef.current) return;
    setSliderValue(fontSize);
    sliderValueRef.current = fontSize;
  }, [fontSize]);

  const handleClickAway = () => {
    setIsExpanded(false);
  };

  const handleSliderChange = (_: Event, value: number | number[]) => {
    const nextValue = Array.isArray(value) ? value[0] : value;
    isSlidingRef.current = true;
    sliderValueRef.current = nextValue;
    setSliderValue(nextValue);
  };

  const handleSliderCommit = () => {
    isSlidingRef.current = false;
    onChange(sliderValueRef.current);
  };

  const hintStep = useMobileFeatureHint();
  const fontHintActive = hintStep >= 1;

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
              value={sliderValue}
              min={14}
              max={22}
              step={1}
              onChange={handleSliderChange}
              onChangeCommitted={handleSliderCommit}
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
            sx={{
              color: 'inherit',
              border: fontHintActive ? '1px solid rgba(196, 159, 120, 0.45)' : '1px solid transparent',
              transform: 'translateY(0) scale(1)',
              transition: 'transform 0.34s ease, border-color 0.34s ease',
              animation: fontHintActive ? `${pulseOutline} 1.8s ease-in-out 0.2s infinite` : 'none'
            }}
          >
            <TextFieldsIcon sx={{ fontSize: 20 }} />
          </IconButton>
        )}
      </Box>

      {/* Desktop: always show full slider */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, px: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 12 }}>S</Typography>
        <Slider
          value={sliderValue}
          min={14}
          max={22}
          step={1}
          onChange={handleSliderChange}
          onChangeCommitted={handleSliderCommit}
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
