import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';

interface LoginPageProps {
  onLogin: (name: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = () => {
    if (email.trim() && password.trim()) {
      onLogin(email.trim());
    }
  };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isSubmitDisabled = !email.trim() || !password.trim() || !emailRegex.test(email) || password.length < 4;

  return (
    <Paper sx={{ p: 4, maxWidth: 520, mx: 'auto' }} elevation={3}>
      <Typography variant="h4" gutterBottom>
        লেখকের পাতা
      </Typography>
      {/* <Typography sx={{ mb: 3, color: 'var(--batayan-muted)' }}>
        এমভিপি লগইন, কোনো ডাটাবেস ছাড়া সরল সেশন মডেল।
      </Typography> */}
      <Box sx={{ display: 'grid', gap: 2 }}>
        <TextField
          label="আপনার ইমেইল"
          value={email}
          type='email'
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextField
          label="আপনার পাসওয়ার্ড"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button variant="contained" onClick={submit} disabled={isSubmitDisabled}>
          প্রবেশ করুন
        </Button>
      </Box>
    </Paper>
  );
}
