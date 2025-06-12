// src/pages/RecipeDetailPage.js (实现交错动画的最终完整版)

import React, { useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRecipeDetail, addRecipeToShoppingList, deleteRecipe } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useFavorite } from '../hooks/useFavorite';
import { useApi } from '../hooks/useApi';
import { useNotification } from '../context/NotificationContext';
import ReviewSection from '../components/ReviewSection';
import { motion } from 'framer-motion';

// --- MUI & Icon Imports ---
import { 
    Box, Button, Typography, CircularProgress, Alert, Paper,
    List, ListItem, ListItemIcon, ListItemText, Divider, Chip 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SpeedIcon from '@mui/icons-material/Speed';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LabelIcon from '@mui/icons-material/Label';

// --- 动画 Variants 定义 ---
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // 每个子元素出现的间隔
    },
  },
};

const fadeInUp = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};
// --- 结束动画定义 ---

function RecipeDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const { data: initialRecipe, loading, error, request: fetchRecipe } = useApi(getRecipeDetail);
  const { recipe, toggleFavorite } = useFavorite(initialRecipe);

  const difficultyMap = useMemo(() => ({
     1: '简单',
     2: '中等',
     3: '困难'
  }), []);

  const difficultyText = recipe ? (difficultyMap[recipe.difficulty] || '未知') : '';

  useEffect(() => {
    fetchRecipe(id);
  }, [id, fetchRecipe]);

  const handleAddToShoppingList = async () => {
    try {
      const response = await addRecipeToShoppingList(id);
      showNotification(response.data.detail, 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || '添加到购物清单失败，请稍后再试。';
      showNotification(errorMessage, 'error');
      console.error(err);
    }
  };

  const handleDeleteRecipe = async () => {
    if (window.confirm(`确定要删除菜谱 "${recipe.title}" 吗？此操作不可撤销！`)) {
      try {
        await deleteRecipe(id);
        showNotification('菜谱已删除。', 'info');
        navigate('/recipes');
      } catch (err) {
        showNotification('删除失败，你可能没有权限或网络出错了。', 'error');
        console.error(err);
      }
    }
  };

  if (loading) return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
  if (error) return <Alert severity="error" sx={{ mt: 4 }}>获取菜谱详情失败: {error.detail || '请刷新页面重试'}</Alert>;
  if (!recipe) return <Alert severity="warning" sx={{ mt: 4 }}>未找到该菜谱。</Alert>;

  return (
    <Paper elevation={3} sx={{ maxWidth: '900px', margin: 'auto', p: { xs: 2, md: 4 }, mt: 4, overflow: 'hidden' }}>
      {/* 将所有内容包裹在一个 motion.div 容器中 */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeInUp}>
          <Box 
              component="img"
              src={recipe.main_image || 'https://via.placeholder.com/800x400.png?text=No+Image'} 
              alt={recipe.title} 
              sx={{ 
                width: '100%', height: 'auto', maxHeight: 450, objectFit: 'cover', 
                borderRadius: 2, mb: 2, display: 'block' 
              }}
          />
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mt: 2 }}>{recipe.title}</Typography>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            作者: {recipe.author_username || '匿名'} | 更新于: {new Date(recipe.updated_at).toLocaleDateString()}
          </Typography>
        </motion.div>
        
        <motion.div variants={fadeInUp}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
            <Chip icon={<SpeedIcon />} label={`难度: ${difficultyText}`} color="primary" variant="outlined" onClick={() => {}} />
            <Chip icon={<AccessTimeIcon />} label={`时间: ${recipe.cooking_time_minutes || '?'}分钟`} color="primary" variant="outlined" onClick={() => {}} />
            {recipe.cuisine_type && <Chip icon={<RestaurantIcon />} label={`菜系: ${recipe.cuisine_type}`} color="primary" variant="outlined" onClick={() => {}} />}
            {recipe.dietary_tags.map(tag => <Chip key={tag.id} icon={<LabelIcon />} label={tag.name} color="secondary" variant="filled" onClick={() => {}} />)}
          </Box>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, my: 3, borderTop: 1, borderColor: 'divider', pt: 3, pb: 2 }}>
            {user && user.username === recipe.author_username && (
              <>
                <Button component={Link} to={`/recipes/${id}/edit`} variant="outlined" size="small" startIcon={<EditIcon />}>编辑</Button>
                <Button onClick={handleDeleteRecipe} variant="outlined" size="small" color="error" startIcon={<DeleteIcon />}>删除</Button>
              </>
            )}
            {user && <Button onClick={handleAddToShoppingList} variant="contained" size="small" startIcon={<ShoppingCartIcon />}>一键加入清单</Button>}
            {user && <Button onClick={toggleFavorite} variant="contained" size="small" color="secondary" startIcon={recipe.is_favorited ? <FavoriteIcon /> : <FavoriteBorderIcon />}>{recipe.is_favorited ? '已收藏' : '收藏'}</Button>}
          </Box>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Typography variant="h5" component="h3" gutterBottom>简介</Typography>
          <Typography paragraph sx={{mb: 4, fontSize: '1.1rem', lineHeight: 1.7}}>{recipe.description || '暂无简介'}</Typography>
        </motion.div>

        <motion.div variants={fadeInUp}>
            <Divider sx={{ my: 4 }} />
            <Typography variant="h5" component="h3" gutterBottom>所需食材</Typography>
            <List>
                {recipe.recipe_ingredients.map(item => (
                <ListItem key={item.ingredient_id} disablePadding>
                    <ListItemIcon sx={{minWidth: 40}}><MenuBookIcon color="primary" /></ListItemIcon>
                    <ListItemText primary={`${item.ingredient_name}: ${item.quantity} ${item.unit}`} secondary={item.notes || null} />
                </ListItem>
                ))}
            </List>
        </motion.div>

        <motion.div variants={fadeInUp}>
            <Divider sx={{ my: 4 }} />
            <Typography variant="h5" component="h3" sx={{mt: 3, mb: 2}} gutterBottom>制作步骤</Typography>
            {recipe.steps && recipe.steps.length > 0 ? (
                <List sx={{ listStyleType: 'none', pl: 0 }}>
                {recipe.steps.map(step => (
                    <ListItem key={step.id} alignItems="flex-start" sx={{mb: 2, borderLeft: 3, borderColor: 'primary.light', pl: 2, bgcolor: 'background.default', borderRadius:1 }}>
                        <Typography variant="h6" color="primary.main" sx={{mr: 2, mt: 0.5, fontWeight:'bold'}}>{step.step_number}.</Typography>
                        <ListItemText
                            primary={<Typography variant="body1" sx={{lineHeight: 1.8}}>{step.description}</Typography>}
                            secondary={step.image && <Box component="img" src={step.image} alt={`步骤 ${step.step_number}`} sx={{maxWidth: '250px', borderRadius: 1, mt: 1.5, boxShadow: 3}}/>}
                            sx={{ m: 0 }}
                        />
                    </ListItem>
                ))}
                </List>
            ) : (
                <Typography paragraph>暂无详细步骤。</Typography>
            )}
        </motion.div>

        <motion.div variants={fadeInUp}>
            <ReviewSection recipeId={id} />
        </motion.div>
      </motion.div>
    </Paper>
  );
}

export default RecipeDetailPage;