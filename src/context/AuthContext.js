// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getUserProfile } from '../api/api';
import { jwtDecode } from 'jwt-decode'; // 需要安装 jwt-decode: npm install jwt-decode

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // 可选：检查token是否过期
          const decodedToken = jwtDecode(token);
          if (decodedToken.exp * 1000 > Date.now()) {
            const response = await getUserProfile();
            setUser(response.data);
          } else {
            // token过期
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          // token可能无效
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    try {
      const response = await getUserProfile();
      setUser(response.data);
    } catch (error) {
       console.error("Login failed to fetch profile:", error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // 可选：调用后端接口使refresh token失效
  };
  
  const authContextValue = {
    user,
    setUser,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 创建一个自定义Hook，方便在组件中使用AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};