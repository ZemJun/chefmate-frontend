// src/pages/HomePage.js (修改后)
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Typography, Container, Paper, Fade } from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

function HomePage() {
  const { user } = useAuth();
  return (
    <Fade in={true} timeout={1000}>
      <Container maxWidth="md">
        <Paper 
          elevation={4}
          sx={{
            mt: 8,
            p: { xs: 3, md: 6 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            background: 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)',
            color: 'white',
            borderRadius: 3,
          }}
        >
          <RestaurantMenuIcon sx={{ fontSize: 60, mb: 2 }} />
          <Typography component="h1" variant="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            欢迎来到 ChefMate AI
          </Typography>
          <Typography variant="h5" color="inherit" paragraph>
            你的个性化菜谱生成与智能购物清单助手。
          </Typography>
          
          <Box sx={{ mt: 4 }}>
            {user ? (
              <Button
                component={RouterLink}
                to="/recipes"
                variant="contained"
                size="large"
                sx={{ 
                  bgcolor: 'white', 
                  color: 'primary.main', 
                  '&:hover': { bgcolor: '#f1f1f1' } 
                }}
              >
                开始探索菜谱
              </Button>
            ) : (
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                size="large"
                sx={{ 
                  bgcolor: 'white', 
                  color: 'primary.main', 
                  '&:hover': { bgcolor: '#f1f1f1' } 
                }}
              >
                登录以开始
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
    </Fade>
  );
}

export default HomePage;