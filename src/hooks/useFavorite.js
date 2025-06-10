// src/hooks/useFavorite.js

import { useState, useEffect } from 'react';
import { favoriteRecipe, unfavoriteRecipe } from '../api/api';
import { useAuth } from '../context/AuthContext';

export const useFavorite = (initialRecipe) => {
  const [recipe, setRecipe] = useState(initialRecipe);
  const { user } = useAuth();
  
  // 当传入的菜谱数据更新时（例如，从列表页进入详情页），同步状态
  useEffect(() => {
    setRecipe(initialRecipe);
  }, [initialRecipe]);
  
  const toggleFavorite = async () => {
    if (!user || !recipe) {
      alert("请先登录再进行收藏操作。");
      return;
    }

    // 先在UI上立即更新，提供更好的用户体验
    const originalRecipe = recipe;
    const newRecipeState = { ...recipe, is_favorited: !recipe.is_favorited };
    setRecipe(newRecipeState);

    // 然后发送API请求
    try {
      if (originalRecipe.is_favorited) {
        await unfavoriteRecipe(originalRecipe.id);
      } else {
        await favoriteRecipe(originalRecipe.id);
      }
    } catch (error) {
      console.error("Favorite toggle failed:", error);
      // 如果API请求失败，将UI状态恢复到原始状态
      setRecipe(originalRecipe); 
      alert("操作失败，请稍后再试。");
    }
  };

  return { recipe, toggleFavorite };
};