// src/pages/FavoriteRecipesPage.js (新文件)

import React, { useEffect } from 'react';
import { getFavoriteRecipes } from '../api/api';
import { useApi } from '../hooks/useApi';
import RecipeCard from '../components/RecipeCard';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';

const listContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 2,
    mt: 4,
};

function FavoriteRecipesPage() {
    const { data: recipesData, loading, error, request: fetchFavorites } = useApi(getFavoriteRecipes);
    const recipes = recipesData?.results || [];

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    if (loading) return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
    if (error) return <Alert severity="error">获取收藏列表失败，请稍后再试。</Alert>;

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                我的收藏
            </Typography>
            <Box sx={listContainerStyle}>
                {recipes.length > 0 ? (
                    recipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)
                ) : (
                    <Typography color="text.secondary">你还没有收藏任何菜谱哦！</Typography>
                )}
            </Box>
            {/* 你可以在这里添加分页逻辑 */}
        </Box>
    );
}

export default FavoriteRecipesPage;