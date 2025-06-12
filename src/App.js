// src/App.js (添加页面过渡动画)

import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom'; // 引入 useLocation
import { AnimatePresence, motion } from 'framer-motion'; // 引入 framer-motion
import Layout from './components/Layout';

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
import FavoriteRecipesPage from './pages/FavoriteRecipesPage'; 
function App() {
  const location = useLocation();

  // 定义页面切换动画
  const pageVariants = {
    initial: {
      opacity: 0,

    },
    in: {
      opacity: 1,

    },
    out: {
      opacity: 0,

    },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4,
  };

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          <Routes location={location}>
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
            <Route path="/my-favorites" element={<FavoriteRecipesPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

export default App;