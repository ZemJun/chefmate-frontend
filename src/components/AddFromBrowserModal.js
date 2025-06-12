// src/components/AddFromBrowserModal.js (替换为最终版本)

import React, { useState, useEffect, useMemo } from 'react';
import { getSimpleRecipeList, getRecipeDetail } from '../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Tabs, Tab, Box,
    List, ListItem, ListItemText, Checkbox, FormControlLabel, CircularProgress,
    Accordion, AccordionSummary, AccordionDetails, Typography, Paper, Grid, Chip, ListItemButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// 食材选择项组件
const IngredientChip = ({ ingredient, isSelected, isDisabled, onToggle }) => (
    <Grid item xs={6} sm={4} md={3}>
        <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            <Paper
                variant="outlined"
                onClick={() => !isDisabled && onToggle(ingredient.id)}
                sx={{
                    p: 1.5, textAlign: 'center', cursor: isDisabled ? 'not-allowed' : 'pointer',
                    position: 'relative', overflow: 'hidden',
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    backgroundColor: isDisabled ? 'action.disabledBackground' : (isSelected ? 'action.hover' : 'background.paper'),
                    color: isDisabled ? 'text.disabled' : 'text.primary',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        borderColor: isDisabled ? 'divider' : 'primary.light',
                        transform: isDisabled ? 'none' : 'translateY(-2px)',
                        boxShadow: isDisabled ? 'none' : 3,
                    }
                }}
            >
                <AnimatePresence>
                    {isSelected && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }} style={{ position: 'absolute', top: 4, right: 4 }}
                        >
                            <CheckCircleIcon color="primary" fontSize="small" />
                        </motion.div>
                    )}
                </AnimatePresence>
                <Typography variant="body2">{ingredient.name}</Typography>
            </Paper>
        </motion.div>
    </Grid>
);

// 食材分组辅助函数
const groupIngredientsByCategory = (ingredients) => {
    if (!ingredients || ingredients.length === 0) return [];
    const grouped = ingredients.reduce((acc, ing) => {
        const category = ing.category_display || '其他';
        if (!acc[category]) { acc[category] = []; }
        acc[category].push(ing);
        return acc;
    }, {});
    return Object.entries(grouped).sort(([catA], [catB]) => catA.localeCompare(catB));
};

// VVVVVV 新增的菜谱分组辅助函数 VVVVVV
const groupRecipesByCuisine = (recipes) => {
    if (!recipes || recipes.length === 0) return [];
    const grouped = recipes.reduce((acc, recipe) => {
        const cuisine = recipe.cuisine_type || '其他菜系';
        if (!acc[cuisine]) { acc[cuisine] = []; }
        acc[cuisine].push(recipe);
        return acc;
    }, {});
    return Object.entries(grouped).sort(([cuisineA], [cuisineB]) => cuisineA.localeCompare(cuisineB));
};
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

function AddFromBrowserModal({ open, onClose, onAdd, allIngredients, existingItemIds }) {
    const [activeTab, setActiveTab] = useState(0);
    const [selectedIngredients, setSelectedIngredients] = useState(new Set());
    const [recipes, setRecipes] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [recipeIngredients, setRecipeIngredients] = useState([]);
    const [loading, setLoading] = useState({ recipes: false, recipeDetails: false });

    const categorizedIngredients = useMemo(() => groupIngredientsByCategory(allIngredients), [allIngredients]);
    // VVVVVV 新增的 useMemo VVVVVV
    const categorizedRecipes = useMemo(() => groupRecipesByCuisine(recipes), [recipes]);
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

    useEffect(() => {
        if (open) {
            setLoading(prev => ({ ...prev, recipes: true }));
            getSimpleRecipeList()
                .then(res => setRecipes(res.data || []))
                .catch(err => console.error("Failed to fetch simple recipe list", err))
                .finally(() => setLoading(prev => ({ ...prev, recipes: false })));
        }
    }, [open]);

    useEffect(() => {
        if (selectedRecipe) {
            setLoading(prev => ({ ...prev, recipeDetails: true }));
            getRecipeDetail(selectedRecipe.id)
                .then(res => setRecipeIngredients(res.data.recipe_ingredients || []))
                .catch(err => console.error("Failed to fetch recipe ingredients", err))
                .finally(() => setLoading(prev => ({ ...prev, recipeDetails: false })));
        } else {
            setRecipeIngredients([]);
        }
    }, [selectedRecipe]);

    const handleToggle = (ingredientId) => {
        setSelectedIngredients(prev => {
            const newSet = new Set(prev);
            if (newSet.has(ingredientId)) { newSet.delete(ingredientId); } else { newSet.add(ingredientId); }
            return newSet;
        });
    };
    
    const handleAddAndClose = () => { onAdd(Array.from(selectedIngredients)); handleClose(); };
    const handleClose = () => { setSelectedIngredients(new Set()); setSelectedRecipe(null); setRecipeIngredients([]); onClose(); };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle>浏览并添加食材</DialogTitle>
            <DialogContent dividers sx={{ p: 1, bgcolor: 'background.default' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%', bgcolor: 'background.paper', px:2 }}>
                    <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                        <Tab label="按分类浏览" />
                        <Tab label="从菜谱添加" />
                    </Tabs>
                </Box>

                {/* 按分类浏览 Tab */}
                {activeTab === 0 && (
                    <Box sx={{ pt: 2, maxHeight: '60vh', overflowY: 'auto' }}>
                        {categorizedIngredients.map(([category, ingredients]) => (
                            <Accordion key={category} defaultExpanded elevation={0} square>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>{category}</Typography><Chip label={ingredients.length} size="small" sx={{ ml: 2 }}/></AccordionSummary>
                                <AccordionDetails><Grid container spacing={1.5}>{ingredients.map(ing => (<IngredientChip key={ing.id} ingredient={ing} isSelected={selectedIngredients.has(ing.id)} isDisabled={existingItemIds.has(ing.id)} onToggle={handleToggle}/>))}</Grid></AccordionDetails>
                            </Accordion>
                        ))}
                    </Box>
                )}

                {/* VVVVVV 从菜谱添加 Tab (彻底重构) VVVVVV */}
                {activeTab === 1 && (
                    <Grid container spacing={2} sx={{ height: '60vh', pt: 2 }}>
                        {/* Left Column: Recipe List */}
                        <Grid item xs={12} md={5} sx={{ height: '100%', overflowY: 'auto' }}>
                            {loading.recipes ? <CircularProgress sx={{ display: 'block', margin: 'auto' }} /> : (
                                categorizedRecipes.map(([cuisine, recipesInCuisine]) => (
                                    <Accordion key={cuisine} defaultExpanded elevation={0} square>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>{cuisine}</Typography><Chip label={recipesInCuisine.length} size="small" sx={{ ml: 2 }}/></AccordionSummary>
                                        <AccordionDetails sx={{p: 0}}>
                                            <List dense>
                                                {recipesInCuisine.map(recipe => (
                                                    <ListItemButton key={recipe.id} selected={selectedRecipe?.id === recipe.id} onClick={() => setSelectedRecipe(recipe)}>
                                                        <ListItemText primary={recipe.title} />
                                                    </ListItemButton>
                                                ))}
                                            </List>
                                        </AccordionDetails>
                                    </Accordion>
                                ))
                            )}
                        </Grid>

                        {/* Right Column: Ingredients of selected recipe */}
                        <Grid item xs={12} md={7} sx={{ height: '100%', overflowY: 'auto' }}>
                            <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                {!selectedRecipe ? (
                                    <Box sx={{ m: 'auto', textAlign: 'center', color: 'text.secondary' }}>
                                        <Typography variant="h6">请先在左侧选择一个菜谱</Typography>
                                        <Typography>然后在这里勾选所需食材</Typography>
                                    </Box>
                                ) : loading.recipeDetails ? (
                                    <CircularProgress sx={{ display: 'block', margin: 'auto' }} />
                                ) : (
                                    <>
                                        <Typography variant="h6" gutterBottom>菜谱: {selectedRecipe.title}</Typography>
                                        <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
                                            {recipeIngredients.map(item => (
                                                <ListItem key={item.ingredient_id} dense disablePadding>
                                                    <FormControlLabel
                                                        control={<Checkbox checked={selectedIngredients.has(item.ingredient_id)} onChange={() => handleToggle(item.ingredient_id)} disabled={existingItemIds.has(item.ingredient_id)}/>}
                                                        label={`${item.ingredient_name} (${item.quantity} ${item.unit})`}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                )}

            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>取消</Button>
                <Button onClick={handleAddAndClose} variant="contained" disabled={selectedIngredients.size === 0}>
                    添加 {selectedIngredients.size} 项
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default AddFromBrowserModal;