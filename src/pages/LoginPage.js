// src/pages/LoginPage.js (修改后)
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api/api';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// 导入 MUI 组件
import { 
  Button, 
  TextField, 
  Container, 
  Box, 
  Typography, 
  Alert, 
  Link, 
  CircularProgress,
  Fade
} from '@mui/material';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await loginUser({ username, password });
      await login(response.data.access, response.data.refresh);
      navigate('/'); // 登录成功后跳转到首页
    } catch (err) {
      setError('登录失败，请检查您的用户名和密码。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fade in={true} timeout={500}>
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 3,
            borderRadius: 2,
            boxShadow: 3,
            bgcolor: 'background.paper'
          }}
        >
          <Typography component="h1" variant="h5">
            登录
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="用户名"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="密码"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : '登录'}
            </Button>
            <Link component={RouterLink} to="/register" variant="body2">
              {"还没有账户? 立即注册"}
            </Link>
          </Box>
        </Box>
      </Container>
    </Fade>
  );
}

export default LoginPage;