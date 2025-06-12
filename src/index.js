// src/index.js (深度优化后)

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles'; // 引入 responsiveFontSizes
import CssBaseline from '@mui/material/CssBaseline'; 
import { NotificationProvider } from './context/NotificationContext';

// 创建一个更精致的主题
let theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // 更沉稳的绿色
      light: '#60ad5e',
      dark: '#005005',
    },
    secondary: {
      main: '#ff9800',
      light: '#ffc947',
      dark: '#c66900',
    },
    background: {
      default: '#f4f6f8', // 页面背景色，而不是纯白
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8, // 统一的圆角
  },
  // 组件默认样式覆盖
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          // 更柔和、有层次感的阴影
          boxShadow: 'rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // 按钮文字不大写
          borderRadius: '8px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          }
        }
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          // 手风琴组件的阴影使用Paper的默认值
          boxShadow: 'inherit',
          '&:before': {
            // 移除顶部分割线
            display: 'none',
          }
        }
      }
    }
  },
});

// 让字体大小自适应屏幕
theme = responsiveFontSizes(theme);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline /> {/* CssBaseline 会应用背景色等 */}
        <AuthProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);