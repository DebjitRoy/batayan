import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';

interface LoginPageProps {
  onLogin: (name: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [name, setName] = useState('');

  const submit = () => {
    if (name.trim()) onLogin(name.trim());
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 520, mx: 'auto' }} elevation={3}>
      <Typography variant="h4" gutterBottom>
        লেখক লগইন
      </Typography>
      <Typography sx={{ mb: 3, color: 'var(--batayan-muted)' }}>
        এমভিপি লগইন, কোনো ডাটাবেস ছাড়া সরল সেশন মডেল।
      </Typography>
      <Box sx={{ display: 'grid', gap: 2 }}>
        <TextField
          label="আপনার নাম"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Button variant="contained" onClick={submit} disabled={!name.trim()}>
          প্রবেশ করুন
        </Button>
      </Box>
    </Paper>
  );
}
