// src/App.js (修改后)
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout'; // <-- 导入新的 Layout

// 导入页面组件
import HomePage from './pages/HomePage'; 
import LoginPage from './pages/LoginPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import RegisterPage from './pages/RegisterPage';  
import RecipeListPage from './pages/RecipeListPage';
import ProfilePage from './pages/ProfilePage';
import InventoryPage from './pages/InventoryPage';
import ShoppingListPage from './pages/ShoppingListPage';
import RecipeFormPage from './pages/RecipeFormPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/recipes" element={<RecipeListPage />} />
        <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/shopping-list" element={<ShoppingListPage />} />
        <Route path="/recipes/new" element={<RecipeFormPage />} />
        <Route path="/recipes/:id/edit" element={<RecipeFormPage />} />
      </Routes>
    </Layout>
  );
}

export default App;