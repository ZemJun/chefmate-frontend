// src/App.js
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

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

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav>
      <Link to="/">首页</Link> | <Link to="/recipes">菜谱</Link> |
      {user ? (
        <>
          <Link to="/inventory">我的库存</Link> |
          <Link to="/shopping-list">购物清单</Link> |
          <span> 欢迎, {user.nickname || user.username}! </span>
          <Link to="/profile">个人资料</Link> |
          <button onClick={logout}>登出</button>
        </>
      ) : (
        <Link to="/login">登录</Link>
      )}
    </nav>
  );
}

function App() {
  return (
    <div className="App">
      <Navbar />
      <hr />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/recipes" element={<RecipeListPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/shopping-list" element={<ShoppingListPage />} />
          <Route path="/recipes/new" element={<RecipeFormPage />} /> {/* 创建 */}
          <Route path="/recipes/:id/edit" element={<RecipeFormPage />} /> {/* 编辑 */}
          {/* 其他路由将在这里添加 */}
        </Routes>
      </main>
    </div>
  );
}



export default App;