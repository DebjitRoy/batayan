import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material';

interface RegisterPageProps {
  onRegister: (email: string, password: string) => Promise<void>;
}

export default function RegisterPage({ onRegister }: RegisterPageProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isPasswordValid = password.length >= 4;
  const passwordsMatch = password === confirmPassword;
  const isSubmitDisabled =
    !email.trim() ||
    !password.trim() ||
    !confirmPassword.trim() ||
    !emailRegex.test(email) ||
    !isPasswordValid ||
    !passwordsMatch;

  const submit = async () => {
    if (isSubmitDisabled) return;

    setIsSubmitting(true);
    setError('');
    try {
      await onRegister(email.trim(), password);
      navigate('/admin');
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 520, mx: 'auto' }} elevation={3}>
      <Typography variant="h4" gutterBottom>
        নতুন অ্যাকাউন্ট তৈরি করুন
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
          label="পাসওয়ার্ড"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          helperText={!isPasswordValid && password ? 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষর দীর্ঘ হতে হবে' : ''}
          error={!isPasswordValid && password.length > 0}
        />
        <TextField
          label="পাসওয়ার্ড নিশ্চিত করুন"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          helperText={!passwordsMatch && confirmPassword ? 'পাসওয়ার্ড মেলে না' : ''}
          error={!passwordsMatch && confirmPassword.length > 0}
        />
        <Button
          variant="contained"
          onClick={submit}
          disabled={isSubmitDisabled || isSubmitting}
        >
          অ্যাকাউন্ট তৈরি করুন
        </Button>
        <Box sx={{ textAlign: 'center', pt: 1 }}>
          <Typography variant="body2">
            ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
            <Link to="/login" style={{ color: 'inherit', textDecoration: 'underline' }}>
              প্রবেশ করুন
            </Link>
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
