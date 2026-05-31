import { AppBar, Toolbar, Typography, Button, Box, MenuItem, Menu, IconButton, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../img/logo.png';
import { sectionMeta } from '../pages/SectionPage';

interface NavBarProps {
  // sections: string[];
  user: { name: string } | null;
  onLogout: () => void;
  colorMode: 'dark' | 'light';
  onColorModeToggle: () => void;
}

export default function NavBar({ user, onLogout, colorMode, onColorModeToggle }: NavBarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navIconColor = 'var(--batayan-text)';

  return (
    <AppBar position="fixed" color="transparent" elevation={0} sx={{ borderBottom: '1px solid var(--batayan-border)', top: 0, left: 0, right: 0, zIndex: 1100, bgcolor: 'var(--batayan-nav-bg)', backdropFilter: 'blur(10px)', transition: 'background-color 0.28s ease, border-color 0.28s ease' }}>
      <Toolbar sx={{ flexWrap: 'wrap', gap: 2 }}>
        <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1, textDecoration: 'none' }}>
          <Box component="img" src={logo} alt="Batayan logo" sx={{ height: 36, width: 'auto' }} />
        </Box>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
          {Object.entries(sectionMeta).map(([key, value]) => (
            <Button key={key} component={Link} to={`/section/${key}`} color="inherit" sx={{ color: navIconColor }}>
              {value.header}
            </Button>
          ))}
          <Tooltip title={colorMode === 'dark' ? 'Light mode' : 'Dark mode'}>
            <IconButton
              color="inherit"
              aria-label="toggle color mode"
              onClick={onColorModeToggle}
              sx={{ color: navIconColor }}
            >
              {colorMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Search Index">
            <IconButton component={Link} to="/index" color="inherit" sx={{ color: navIconColor }}>
              <SearchIcon />
            </IconButton>
          </Tooltip>
          {user ? (
            <Tooltip title="Admin">
              <IconButton component={Link} to="/admin" color="inherit" sx={{ color: navIconColor }}>
                <AdminPanelSettingsIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Author Login">
              <IconButton component={Link} to="/login" color="inherit" sx={{ color: navIconColor }}>
                <LoginIcon />
              </IconButton>
            </Tooltip>
          )}
          {user && (
            <Tooltip title="Logout">
              <IconButton onClick={onLogout} color="inherit" sx={{ color: navIconColor }}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <IconButton
          size="large"
          edge="end"
          aria-label="menu"
          onClick={(event) => setAnchorEl(event.currentTarget)}
          sx={{ display: { md: 'none' }, color: navIconColor }}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={() => { onColorModeToggle(); setAnchorEl(null); }} sx={{ gap: 1 }}>
            {colorMode === 'dark' ? <LightModeIcon sx={{ mr: 1 }} /> : <DarkModeIcon sx={{ mr: 1 }} />}
            {colorMode === 'dark' ? 'Light mode' : 'Dark mode'}
          </MenuItem>
          {Object.entries(sectionMeta).map(([key, value]) => (
            <MenuItem key={key} onClick={() => setAnchorEl(null)} component={Link} to={`/section/${key}`}>
              {value.header}
            </MenuItem>
          ))}
          <MenuItem onClick={() => setAnchorEl(null)} component={Link} to="/index" sx={{ gap: 1 }}>
            <SearchIcon sx={{ mr: 1 }} /> সূচিপত্র
          </MenuItem>
          {user ? (
            <>
              <MenuItem onClick={() => setAnchorEl(null)} component={Link} to="/admin" sx={{ gap: 1 }}>
                <AdminPanelSettingsIcon sx={{ mr: 1 }} /> লেখকের পাতা
              </MenuItem>
              <MenuItem onClick={() => { setAnchorEl(null); onLogout(); }} sx={{ gap: 1 }}>
                <LogoutIcon sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </>
          ) : (
            <MenuItem onClick={() => setAnchorEl(null)} component={Link} to="/login" sx={{ gap: 1 }}>
              <LoginIcon sx={{ mr: 1 }} /> লেখকের পাতা
            </MenuItem>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
