// src/pages/RegisterPage.js (MUI重构后)

import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { registerUser } from '../api/api';
import { useNotification } from '../context/NotificationContext';

// 导入 MUI 组件
import { 
  Button, TextField, Container, Box, Typography, 
  Link, CircularProgress, Grid, Paper, Avatar, Fade
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', password2: '', nickname: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (formData.password !== formData.password2) {
      setErrors({ password2: '两次输入的密码不一致。' });
      return;
    }
    setLoading(true);
    try {
      await registerUser({
        username: formData.username, email: formData.email,
        password: formData.password, password2: formData.password2,
        nickname: formData.nickname,
      });
      showNotification('注册成功！请登录。', 'success');
      navigate('/login');
    } catch (err) {
      if (err.response && err.response.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ general: '注册失败，请稍后再试。' });
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fade in={true} timeout={500}>
      <Container component="main" maxWidth="xs">
        <Paper elevation={3} sx={{
          marginTop: 8,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            注册新账户
          </Typography>
          {errors.general && <Typography color="error" sx={{ mt: 2 }}>{errors.general}</Typography>}
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required fullWidth autoFocus
                  id="username" label="用户名" name="username"
                  value={formData.username} onChange={handleChange}
                  error={!!errors.username} helperText={errors.username}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required fullWidth
                  id="email" label="邮箱" name="email"
                  value={formData.email} onChange={handleChange}
                  error={!!errors.email} helperText={errors.email}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="nickname" label="昵称 (可选)" name="nickname"
                  value={formData.nickname} onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required fullWidth
                  name="password" label="密码" type="password" id="password"
                  value={formData.password} onChange={handleChange}
                  error={!!errors.password} helperText={errors.password?.join(' ')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required fullWidth
                  name="password2" label="确认密码" type="password" id="password2"
                  value={formData.password2} onChange={handleChange}
                  error={!!errors.password2} helperText={errors.password2}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : '注册'}
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link component={RouterLink} to="/login" variant="body2">
                  已有账户? 返回登录
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Fade>
  );
}

export default RegisterPage;