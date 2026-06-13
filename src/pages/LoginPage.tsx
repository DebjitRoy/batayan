import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isSubmitDisabled = !email.trim() || !password.trim() || !emailRegex.test(email) || password.length < 4;

  const submit = async () => {
    if (isSubmitDisabled) return;

    setIsSubmitting(true);
    setError('');
    try {
      await onLogin(email.trim(), password);
      navigate('/admin');
    } catch {
      setError('Login failed. Please check your email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 520, mx: 'auto' }} elevation={3}>
      <Typography variant="h4" gutterBottom>
        লেখকের পাতা
      </Typography>
      <Box sx={{ display: 'grid', gap: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="আপনার ইমেইল"
          value={email}
          type="email"
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextField
          label="আপনার পাসওয়ার্ড"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button variant="contained" onClick={submit} disabled={isSubmitDisabled || isSubmitting}>
          প্রবেশ করুন
        </Button>
      </Box>
    </Paper>
  );
}
