// src/hooks/useFavorite.js (替换后的完整代码)

import { useState, useEffect } from 'react';
import { favoriteRecipe, unfavoriteRecipe } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext'; // 导入通知 hook

export const useFavorite = (initialRecipe) => {
  const [recipe, setRecipe] = useState(initialRecipe);
  const { user } = useAuth();
  const { showNotification } = useNotification(); // 获取通知函数
  
  // 当传入的菜谱数据更新时，同步状态
  useEffect(() => {
    setRecipe(initialRecipe);
  }, [initialRecipe]);
  
  const toggleFavorite = async () => {
    if (!user || !recipe) {
      // 替换 alert
      showNotification("请先登录再进行收藏操作。", "warning");
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
        // 替换 alert
        showNotification("已取消收藏！", "info");
      } else {
        await favoriteRecipe(originalRecipe.id);
        // 替换 alert
        showNotification("收藏成功！", "success");
      }
    } catch (error) {
      console.error("Favorite toggle failed:", error);
      // 如果API请求失败，将UI状态恢复到原始状态
      setRecipe(originalRecipe); 
      // 替换 alert
      showNotification("操作失败，请稍后再试。", "error");
    }
  };

  return { recipe, toggleFavorite };
};