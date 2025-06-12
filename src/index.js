// src/index.js (修改后)
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles'; // <-- 导入
import CssBaseline from '@mui/material/CssBaseline'; // <-- 导入

// 创建一个基础主题
const theme = createTheme({
  palette: {
    primary: {
      main: '#4caf50', // 一个清新的绿色作为主色调
    },
    secondary: {
      main: '#ff9800', // 一个温暖的橙色作为辅助色
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}> {/* <--- 应用主题 */}
        <CssBaseline /> {/* <--- 应用样式基线 */}
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);