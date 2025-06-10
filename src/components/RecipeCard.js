// src/components/RecipeCard.js

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorite } from '../hooks/useFavorite'; // <-- 导入自定义 Hook

const cardStyle = {
  border: '1px solid #ccc',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px',
  width: '300px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  position: 'relative', // 为了定位收藏按钮
};

const imageStyle = {
  width: '100%',
  height: '180px',
  objectFit: 'cover',
  borderRadius: '4px',
};

const favoriteButtonStyle = {
  position: 'absolute',
  top: '25px',
  right: '25px',
  background: 'rgba(255, 255, 255, 0.8)',
  border: 'none',
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  cursor: 'pointer',
  fontSize: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
};

// 使用传入的 recipe 作为初始值来调用 useFavorite Hook
function RecipeCard({ recipe: initialRecipe }) {
  const { user } = useAuth();
  const { recipe, toggleFavorite } = useFavorite(initialRecipe);

  const handleFavoriteClick = (e) => {
    e.preventDefault(); // 阻止点击事件冒泡到 Link 组件
    e.stopPropagation();
    toggleFavorite();
  };

  if (!recipe) return null; // 如果没有 recipe 数据，不渲染任何东西

  return (
    <div style={cardStyle}>
      <Link to={`/recipes/${recipe.id}`}>
        <img 
          src={recipe.main_image || 'https://via.placeholder.com/300x180.png?text=No+Image'} 
          alt={recipe.title} 
          style={imageStyle}
        />
        <h3>{recipe.title}</h3>
      </Link>
      
      {/* 收藏按钮 */}
      {user && (
        <button onClick={handleFavoriteClick} style={favoriteButtonStyle} title={recipe.is_favorited ? '取消收藏' : '收藏'}>
          {recipe.is_favorited ? '❤️' : '🤍'}
        </button>
      )}

      <p>难度: {recipe.difficulty || '未知'} | 烹饪时间: {recipe.cooking_time_minutes || '?'} 分钟</p>
      <p>作者: {recipe.author_username || '匿名'}</p>
      {recipe.match_score !== undefined && recipe.match_score !== null && (
        <p style={{ color: 'green', fontWeight: 'bold' }}>
          食材匹配度: {Math.round(recipe.match_score * 100)}%
        </p>
      )}
    </div>
  );
}

export default RecipeCard;