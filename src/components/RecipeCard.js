// src/components/RecipeCard.js (修改后)
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

// 使用 MUI 的 Card 组件来创建一个更具吸引力的卡片
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
        width: 345, 
        m: 2, 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6,
        }
      }}
    >
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
        
        {/* 使用 Box 和 Chip 来展示标签信息，更美观 */}
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

        {/* 智能推荐的匹配度，使用 Chip 组件 */}
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