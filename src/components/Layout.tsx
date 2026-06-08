import { ReactNode } from 'react';
import { Container, Box } from '@mui/material';
import NavBar from './NavBar';
import FontSizeController from './FontSizeController';

interface LayoutProps {
  children: ReactNode;
  user: { name: string; token: string } | null;
  onLogout: () => void;
  fontSize: number;
  onFontSizeChange: (value: number) => void;
  colorMode: 'dark' | 'light';
  onColorModeToggle: () => void;
}

export default function Layout({
  children,
  user,
  onLogout,
  fontSize,
  onFontSizeChange,
  colorMode,
  onColorModeToggle
}: LayoutProps) {
  return (
    <Box sx={{ position: 'relative' }}>
      <NavBar user={user} onLogout={onLogout} colorMode={colorMode} onColorModeToggle={onColorModeToggle} />
      <Box sx={{ pt: { xs: 7, md: 8 } }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ fontSize: `${fontSize}px` }}>{children}</Box>
        </Container>
      </Box>
      <FontSizeController fontSize={fontSize} onChange={onFontSizeChange} />
    </Box>
  );
}
