// src/pages/RecipeDetailPage.js (替换后的完整代码)

import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRecipeDetail, addRecipeToShoppingList, deleteRecipe } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useFavorite } from '../hooks/useFavorite';
import { useApi } from '../hooks/useApi';
import { useNotification } from '../context/NotificationContext'; // 导入通知 hook
import ReviewSection from '../components/ReviewSection';

import { Box, Button, Typography, CircularProgress, Alert, Paper } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

function RecipeDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification(); // 获取通知函数

  const { data: initialRecipe, loading, error, request: fetchRecipe } = useApi(getRecipeDetail);
  const { recipe, toggleFavorite } = useFavorite(initialRecipe);

  useEffect(() => {
    fetchRecipe(id);
  }, [id, fetchRecipe]);

  const handleAddToShoppingList = async () => {
    try {
      const response = await addRecipeToShoppingList(id);
      // 替换 alert
      showNotification(response.data.detail, 'success');
    } catch (err) {
      // 替换 alert
      const errorMessage = err.response?.data?.detail || '添加到购物清单失败，请稍后再试。';
      showNotification(errorMessage, 'error');
      console.error(err);
    }
  };

  const handleDeleteRecipe = async () => {
    if (window.confirm(`确定要删除菜谱 "${recipe.title}" 吗？此操作不可撤销！`)) {
      try {
        await deleteRecipe(id);
        // 替换 alert
        showNotification('菜谱已删除。', 'info');
        navigate('/recipes');
      } catch (err) {
        // 替换 alert
        showNotification('删除失败，你可能没有权限或网络出错了。', 'error');
        console.error(err);
      }
    }
  };

  if (loading) return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
  if (error) return <Alert severity="error" sx={{ mt: 4 }}>获取菜谱详情失败: {error.detail || '请刷新页面重试'}</Alert>;
  if (!recipe) return <Alert severity="warning" sx={{ mt: 4 }}>未找到该菜谱。</Alert>;

  return (
    <Paper elevation={3} sx={{ maxWidth: '800px', margin: 'auto', p: { xs: 2, md: 4 }, mt: 4 }}>
      <Box 
        component="img"
        src={recipe.main_image || 'https://via.placeholder.com/800x400.png?text=No+Image'} 
        alt={recipe.title} 
        sx={{ width: '100%', borderRadius: 2, mb: 2 }}
      />
      <Typography variant="h3" component="h1" gutterBottom>{recipe.title}</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        作者: {recipe.author_username || '匿名'} | 更新于: {new Date(recipe.updated_at).toLocaleDateString()}
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, my: 3, borderBottom: '1px solid #eee', pb: 3 }}>
        {user && user.username === recipe.author_username && (
          <>
            <Button component={Link} to={`/recipes/${id}/edit`} variant="outlined" startIcon={<EditIcon />}>
              编辑菜谱
            </Button>
            <Button onClick={handleDeleteRecipe} variant="outlined" color="error" startIcon={<DeleteIcon />}>
              删除菜谱
            </Button>
          </>
        )}
        {user && (
          <Button onClick={handleAddToShoppingList} variant="contained" startIcon={<ShoppingCartIcon />}>
            一键加入购物清单
          </Button>
        )}
        {user && (
          <Button onClick={toggleFavorite} variant="contained" color="secondary" startIcon={recipe.is_favorited ? <FavoriteIcon /> : <FavoriteBorderIcon />}>
            {recipe.is_favorited ? '已收藏' : '收藏'}
          </Button>
        )}
      </Box>

      <Typography variant="h5" component="h3">简介</Typography>
      <Typography paragraph sx={{mb: 3}}>{recipe.description || '暂无简介'}</Typography>

      <Typography variant="h5" component="h3">所需食材</Typography>
      <ul>
        {recipe.recipe_ingredients.map(item => (
          <li key={item.ingredient_id}>
            {item.ingredient_name}: {item.quantity} {item.unit}
            {item.notes && <span> ({item.notes})</span>}
          </li>
        ))}
      </ul>
      
      <Typography variant="h5" component="h3" sx={{mt: 3}}>制作步骤</Typography>
      {recipe.steps && recipe.steps.length > 0 ? (
        <ol>
          {recipe.steps.map(step => (
            <li key={step.id} style={{ marginBottom: '15px' }}>
              <Typography>{step.description}</Typography>
              {step.image && <Box component="img" src={step.image} alt={`步骤 ${step.step_number}`} sx={{maxWidth: '200px', borderRadius: 1, mt: 1}}/>}
            </li>
          ))}
        </ol>
      ) : (
        <Typography paragraph>暂无详细步骤。</Typography>
      )}

      <ReviewSection recipeId={id} />
    </Paper>
  );
}

export default RecipeDetailPage;