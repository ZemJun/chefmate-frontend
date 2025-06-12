// src/components/Layout.js (最终版)

import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';

function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
            ChefMate AI
          </Typography>
          
          <Button color="inherit" component={RouterLink} to="/recipes">菜谱</Button>
          
          {user ? (
            <>
              <Button color="inherit" component={RouterLink} to="/my-favorites">我的收藏</Button>
              <Button color="inherit" component={RouterLink} to="/inventory">我的库存</Button>
              <Button color="inherit" component={RouterLink} to="/shopping-list">购物清单</Button>
              <Button color="inherit" component={RouterLink} to="/profile">
                {user.nickname || user.username}
              </Button>
              <Button color="inherit" onClick={handleLogout}>登出</Button>
            </>
          ) : (
            <Button color="inherit" component={RouterLink} to="/login">登录</Button>
          )}
        </Toolbar>
      </AppBar>
      
      <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
        {children}
      </Container>

      <Box component="footer" sx={{ bgcolor: 'background.paper', p: 3, mt: 'auto' }}>
         <Typography variant="body2" color="text.secondary" align="center">
           {'Copyright © '}
           <RouterLink to="/" style={{color: 'inherit'}}>
             ChefMate AI
           </RouterLink>{' '}
           {new Date().getFullYear()}
           {'.'}
         </Typography>
      </Box>
    </Box>
  );
}

export default Layout;