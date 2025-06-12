import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getRecipes, getDietaryTags, getInventory } from '../api/api';
import RecipeCard from '../components/RecipeCard';
import RecipeCardSkeleton from '../components/RecipeCardSkeleton'; // 引入骨架屏
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import {
    Box, Button, Typography, TextField, FormControl, InputLabel, Select, MenuItem,
    Grid, Paper, CircularProgress, Alert, FormGroup, FormControlLabel, Checkbox, Accordion, AccordionSummary, AccordionDetails, Pagination // 引入Pagination
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const listContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '16px', // 使用gap代替margin，布局更佳
};

function RecipeListPage() {
    const { user } = useAuth();
    const { data: recipesData, loading, error, request: fetchRecipes } = useApi(getRecipes);
    const recipes = recipesData?.results || [];
    const totalPages = recipesData ? Math.ceil(recipesData.count / 10) : 1; // 假设每页10条

    const [filters, setFilters] = useState({
        search: '', cooking_time_minutes__lte: '', difficulty: '',
        cuisine_type__icontains: '', dietary_tags__name__in: [], available_ingredients: '',
    });
    
    const [allTags, setAllTags] = useState([]);
    const [userInventory, setUserInventory] = useState([]);
    const [optionsLoading, setOptionsLoading] = useState(true);
    const [selectedInventoryForSearch, setSelectedInventoryForSearch] = useState([]);

    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search);
    const currentPage = parseInt(query.get('page') || '1', 10);


    useEffect(() => {
        setOptionsLoading(true);
        const fetchOptions = async () => {
            try {
                const tagsPromise = getDietaryTags();
                const inventoryPromise = user ? getInventory() : Promise.resolve(null);
                const [tagsRes, inventoryRes] = await Promise.all([tagsPromise, inventoryPromise]);
                setAllTags(tagsRes?.data?.results || tagsRes?.data || []);
                if (inventoryRes) {
                    setUserInventory(inventoryRes?.data?.results || inventoryRes?.data || []);
                } else {
                    setUserInventory([]);
                }
            } catch (err) {
                console.error("Failed to fetch filter options", err);
            } finally {
                setOptionsLoading(false);
            }
        };
        fetchOptions();
    }, [user]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const activeFilters = {};
            for (const key in filters) {
                const value = filters[key];
                if (value !== null && value !== '' && value.length !== 0) {
                    activeFilters[key] = Array.isArray(value) ? value.join(',') : value;
                }
            }
            activeFilters.page = currentPage; // 添加 page 参数
            fetchRecipes(activeFilters);
        }, 500);
        return () => clearTimeout(timer);
    }, [filters, fetchRecipes, currentPage]); // 添加 currentPage 依赖

    const handleFilterChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleTagChange = (e) => setFilters(prev => ({ ...prev, dietary_tags__name__in: e.target.value }));
    const handleResetFilters = () => {
        setSelectedInventoryForSearch([]);
        setFilters({ search: '', cooking_time_minutes__lte: '', difficulty: '', cuisine_type__icontains: '', dietary_tags__name__in: [], available_ingredients: '' });
        if (currentPage !== 1) {
            navigate('/recipes');
        }
    };
    const handleInventorySelectChange = (e) => {
        const { value, checked } = e.target;
        setSelectedInventoryForSearch(prev => checked ? [...prev, value] : prev.filter(id => id !== value));
    };
    const handleSmartSearch = () => setFilters(prev => ({ ...prev, available_ingredients: selectedInventoryForSearch.join(',') }));
    
    const handlePageChange = (event, value) => {
        // 更新 URL, 这会触发 useEffect 重新获取数据
        navigate(`/recipes?page=${value}`);
    };

    if (error) return <Alert severity="error">获取菜谱失败，请稍后再试。</Alert>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">所有菜谱</Typography>
                <Box>
                    {user && (
                        <Button component={Link} to="/recipes/new" variant="contained" startIcon={<AddIcon />} sx={{ mr: 2 }}>
                            创建新菜谱
                        </Button>
                    )}
                    <Button variant="outlined" onClick={handleResetFilters} startIcon={<RestartAltIcon />}>
                        重置筛选
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ p: 2, mb: 4 }}>
                <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>筛选与搜索</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {optionsLoading ? <CircularProgress size={20} /> : (
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={6} md={3}>
                                    <TextField fullWidth label="按名称或描述搜索..." name="search" value={filters.search} onChange={handleFilterChange} variant="outlined" />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <TextField fullWidth type="number" label="最长烹饪时间(分钟)" name="cooking_time_minutes__lte" value={filters.cooking_time_minutes__lte} onChange={handleFilterChange} variant="outlined" />
                                </Grid>
                                <Grid item xs={12} sm={6} md={2}>
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel>难度</InputLabel>
                                        <Select label="难度" name="difficulty" value={filters.difficulty} onChange={handleFilterChange}>
                                            <MenuItem value="">所有难度</MenuItem><MenuItem value="1">简单</MenuItem><MenuItem value="2">中等</MenuItem><MenuItem value="3">困难</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField fullWidth label="菜系 (如: 川菜)" name="cuisine_type__icontains" value={filters.cuisine_type__icontains} onChange={handleFilterChange} variant="outlined" />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel>饮食标签</InputLabel>
                                        <Select multiple label="饮食标签" name="dietary_tags__name__in" value={filters.dietary_tags__name__in} onChange={handleTagChange}>
                                            {allTags.map(tag => (
                                                <MenuItem key={tag.id} value={tag.name}>{tag.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        )}
                    </AccordionDetails>
                </Accordion>
            </Paper>

            {user && (
                <Paper sx={{ p: 2, mb: 4 }}>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>根据我的库存推荐</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {optionsLoading ? <CircularProgress size={20} /> : userInventory.length > 0 ? (
                                <>
                                    <Typography variant="body1" sx={{ mb: 1 }}>勾选你拥有的食材：</Typography>
                                    <FormGroup sx={{ display: 'flex', flexDirection: 'row', maxHeight: '150px', flexWrap: 'wrap', overflowY: 'auto' }}>
                                        {userInventory.map(item => (
                                            <FormControlLabel key={item.id}
                                                control={<Checkbox value={item.ingredient} onChange={handleInventorySelectChange} checked={selectedInventoryForSearch.includes(String(item.ingredient))} />}
                                                label={item.ingredient_name}
                                            />
                                        ))}
                                    </FormGroup>
                                    <Button onClick={handleSmartSearch} variant="contained" sx={{ mt: 2 }}>开始智能推荐</Button>
                                </>
                            ) : (
                                <Typography color="text.secondary">你的库存是空的，快去添加吧！</Typography>
                            )}
                        </AccordionDetails>
                    </Accordion>
                </Paper>
            )}

            {loading ? (
                <Box sx={listContainerStyle}>
                    {Array.from(new Array(6)).map((_, index) => (
                        <RecipeCardSkeleton key={index} />
                    ))}
                </Box>
            ) : (
                <Box sx={listContainerStyle}>
                    {recipes.length > 0 ? (
                        recipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)
                    ) : (
                        <Typography sx={{ mt: 4 }}>没有找到符合条件的菜谱。</Typography>
                    )}
                </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, pb: 4 }}>
                {totalPages > 1 && (
                  <Pagination 
                    count={totalPages} 
                    page={currentPage} 
                    onChange={handlePageChange} 
                    color="primary"
                  />
                )}
            </Box>
        </Box>
    );
}

export default RecipeListPage;