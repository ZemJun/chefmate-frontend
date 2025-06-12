// src/components/RecipeCard.js (优化布局后)
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorite } from '../hooks/useFavorite';

// 导入 MUI 组件
import { 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  IconButton, 
  Box,
  Tooltip,
  Chip
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SpeedIcon from '@mui/icons-material/Speed';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function RecipeCard({ recipe: initialRecipe }) {
  const { user } = useAuth();
  const { recipe, toggleFavorite } = useFavorite(initialRecipe);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite();
  };

  if (!recipe) return null;

  return (
    <Card 
      sx={{ 
        // 移除固定宽度 width: 345 和 margin
        // m: 2, 
        height: '100%', // <--- 新增: 让卡片填满 Grid Item 的高度
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6,
        }
      }}
    >
      {/* ... 卡片内部其他代码保持不变 ... */}
      <Box sx={{ position: 'relative' }}>
        <Link to={`/recipes/${recipe.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <CardMedia
            component="img"
            height="194"
            image={recipe.main_image || 'https://via.placeholder.com/345x194.png?text=ChefMate+AI'}
            alt={recipe.title}
          />
        </Link>
        {user && (
          <Tooltip title={recipe.is_favorited ? '取消收藏' : '收藏'}>
            <IconButton
              onClick={handleFavoriteClick}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                '&:hover': {
                  backgroundColor: 'white',
                }
              }}
            >
              {recipe.is_favorited ? <FavoriteIcon color="secondary" /> : <FavoriteBorderIcon />}
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Link to={`/recipes/${recipe.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography gutterBottom variant="h6" component="div" noWrap title={recipe.title}>
            {recipe.title}
          </Typography>
        </Link>
        <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
          作者: {recipe.author_username || '匿名'}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1, color: 'text.secondary' }}>
          <Tooltip title="难度">
            <SpeedIcon fontSize="small" />
          </Tooltip>
          <Typography variant="body2">{recipe.difficulty || '未知'}</Typography>
          <Tooltip title="烹饪时间">
            <AccessTimeIcon fontSize="small" sx={{ ml: 1 }}/>
          </Tooltip>
          <Typography variant="body2">{recipe.cooking_time_minutes || '?'} 分钟</Typography>
        </Box>

        {recipe.match_score !== undefined && recipe.match_score !== null && (
          <Chip 
            icon={<CheckCircleIcon />} 
            label={`食材匹配度: ${Math.round(recipe.match_score * 100)}%`} 
            color="primary"
            variant="outlined"
            size="small"
            sx={{ mt: 2 }}
          />
        )}
      </CardContent>
    </Card>
  );
}

export default RecipeCard;