// src/pages/RecipeFormPage.js (专业布局版)
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createRecipe, updateRecipe, getRecipeDetail, getAllIngredients, getDietaryTags } from '../api/api';
import Select from 'react-select'; // 使用 react-select

// 导入 MUI 组件
import {
    Container, Box, Typography, TextField, Button, Grid,
    FormControl, InputLabel, Select as MuiSelect, MenuItem, IconButton,
    CircularProgress, Alert, Paper, Fade, Divider, Chip
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

const UNIT_CHOICES = [
    { value: 'g', label: '克 (g)' }, { value: 'kg', label: '千克 (kg)' },
    { value: 'ml', label: '毫升 (ml)' }, { value: 'l', label: '升 (l)' },
    { value: 'tsp', label: '茶匙 (tsp)' }, { value: 'tbsp', label: '汤匙 (tbsp)' },
    { value: 'cup', label: '杯 (cup)' }, { value: 'piece', label: '个/只/颗' },
    { value: 'slice', label: '片' }, { value: 'pinch', label: '撮' },
    { value: 'dash', label: '少量/几滴' }, { value: 'to_taste', label: '适量' },
];

function RecipeFormPage() {
    const { id } = useParams();
    const isEditing = !!id;
    const navigate = useNavigate();

    // State 定义保持不变
    const [formData, setFormData] = useState({
        title: '', description: '', cooking_time_minutes: 30, difficulty: 1,
        cuisine_type: '', main_image: null, dietary_tags: [],
        ingredients_data: [{ ingredient_id: '', quantity: 1, unit: 'g', notes: '' }],
        steps_data: [{ step_number: 1, description: '' }],
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [allIngredients, setAllIngredients] = useState([]);
    const [allTags, setAllTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 数据获取 useEffect 保持不变
    useEffect(() => {
        setLoading(true);
        const optionsPromise = Promise.all([getAllIngredients(), getDietaryTags()])
            .then(([ingredientsRes, tagsRes]) => {
                setAllIngredients(ingredientsRes.data.results || ingredientsRes.data);
                setAllTags(tagsRes.data.results || tagsRes.data);
            }).catch(err => { console.error("Failed to fetch options", err); throw err; });

        let recipePromise = Promise.resolve();
        if (isEditing) {
            recipePromise = getRecipeDetail(id).then(res => {
                const recipe = res.data;
                setFormData({
                    title: recipe.title || '', description: recipe.description || '',
                    cooking_time_minutes: recipe.cooking_time_minutes || 30,
                    difficulty: recipe.difficulty || 1, cuisine_type: recipe.cuisine_type || '',
                    main_image: recipe.main_image || null,
                    dietary_tags: recipe.dietary_tags.map(tag => tag.id),
                    ingredients_data: recipe.recipe_ingredients.length > 0 ? recipe.recipe_ingredients.map(ing => ({
                        ingredient_id: ing.ingredient_id, quantity: ing.quantity, unit: ing.unit, notes: ing.notes || '',
                    })) : [{ ingredient_id: '', quantity: 1, unit: 'g', notes: '' }],
                    steps_data: recipe.steps.length > 0 ? recipe.steps.map(step => ({
                        step_number: step.step_number, description: step.description,
                    })) : [{ step_number: 1, description: '' }],
                });
                if (recipe.main_image) setImagePreview(recipe.main_image);
            }).catch(err => { console.error("Failed to fetch recipe", err); throw err; });
        }
        Promise.all([optionsPromise, recipePromise]).catch(() => setError("加载数据失败，请刷新。")).finally(() => setLoading(false));
    }, [id, isEditing]);

    // 所有 handle 函数保持不变
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setImageFile(e.target.files[0]);
            setImagePreview(URL.createObjectURL(e.target.files[0]));
        }
    };
    const handleIngredientChange = (index, field, value) => {
        const newIngredients = [...formData.ingredients_data];
        newIngredients[index][field] = value;
        setFormData({ ...formData, ingredients_data: newIngredients });
    };
    const addIngredientField = () => setFormData({ ...formData, ingredients_data: [...formData.ingredients_data, { ingredient_id: '', quantity: 1, unit: 'g', notes: '' }] });
    const removeIngredientField = (index) => { if (formData.ingredients_data.length > 1) setFormData({ ...formData, ingredients_data: formData.ingredients_data.filter((_, i) => i !== index) }); };
    const handleStepChange = (index, e) => {
        const newSteps = [...formData.steps_data];
        newSteps[index].description = e.target.value;
        setFormData({ ...formData, steps_data: newSteps });
    };
    const addStepField = () => {
        const nextStepNumber = formData.steps_data.length > 0 ? Math.max(...formData.steps_data.map(s => s.step_number)) + 1 : 1;
        setFormData({ ...formData, steps_data: [...formData.steps_data, { step_number: nextStepNumber, description: '' }] });
    };
    const removeStepField = (index) => { if (formData.steps_data.length > 1) setFormData({ ...formData, steps_data: formData.steps_data.filter((_, i) => i !== index).map((s, i) => ({ ...s, step_number: i + 1 })) }); };
    const handleTagChange = (e) => setFormData({ ...formData, dietary_tags: e.target.value });
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        const submissionData = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'main_image' || key === 'ingredients_data' || key === 'steps_data' || key === 'dietary_tags') return;
            submissionData.append(key, formData[key]);
        });
        if (imageFile) submissionData.append('main_image', imageFile);
        formData.dietary_tags.forEach(tagId => submissionData.append('dietary_tags', tagId));
        submissionData.append('ingredients_data', JSON.stringify(formData.ingredients_data));
        submissionData.append('steps_data', JSON.stringify(formData.steps_data));
        try {
            const response = isEditing ? await updateRecipe(id, submissionData) : await createRecipe(submissionData);
            navigate(`/recipes/${response.data.id}`);
        } catch (err) {
            console.error(err.response?.data || err);
            setError('提交失败，请检查所有字段。');
            setLoading(false);
        }
    };

    if (loading && !isEditing) return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;

    const ingredientOptions = allIngredients.map(ing => ({ value: ing.id, label: ing.name }));

    return (
        <Fade in={true}>
            <Container maxWidth="md">
                <Paper sx={{ p: { xs: 2, md: 4 }, mt: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        {isEditing ? '编辑菜谱' : '创建新菜谱'}
                    </Typography>
                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                    
                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        
                        {/* --- Section 1: 基本信息 --- */}
                        <Typography variant="h6" component="h2" sx={{ mt: 2, mb: 2 }}>基本信息</Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                                <TextField fullWidth required name="title" label="标题" value={formData.title} onChange={handleChange} />
                                <TextField fullWidth multiline rows={4} name="description" label="简介" value={formData.description} onChange={handleChange} sx={{ mt: 3 }}/>
                            </Grid>
                            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <Box sx={{ width: '100%', height: 180, border: '2px dashed grey', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9', overflow: 'hidden' }}>
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="主图预览" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <Typography color="text.secondary">图片预览</Typography>
                                    )}
                                </Box>
                                <Button variant="outlined" component="label" startIcon={<PhotoCamera />} sx={{ mt: 2 }}>
                                    上传主图
                                    <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                                </Button>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 4 }} />

                        {/* --- Section 2: 关键指标 --- */}
                        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>关键指标</Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6} md={3}><TextField fullWidth type="number" name="cooking_time_minutes" label="烹饪时间(分钟)" value={formData.cooking_time_minutes} onChange={handleChange} /></Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth><InputLabel>难度</InputLabel>
                                    <MuiSelect name="difficulty" label="难度" value={formData.difficulty} onChange={handleChange}>
                                        <MenuItem value={1}>简单</MenuItem><MenuItem value={2}>中等</MenuItem><MenuItem value={3}>困难</MenuItem>
                                    </MuiSelect>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}><TextField fullWidth name="cuisine_type" label="菜系 (如: 川菜)" value={formData.cuisine_type} onChange={handleChange} /></Grid>
                            <Grid item xs={12} sm={6} md={3}>
                               <FormControl fullWidth>
                                   <InputLabel>饮食标签</InputLabel>
                                   <MuiSelect multiple name="dietary_tags" label="饮食标签" value={formData.dietary_tags} onChange={handleTagChange}
                                       renderValue={(selected) => (
                                           <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                               {selected.map(value => <Chip key={value} label={allTags.find(t=>t.id === value)?.name || ''} />)}
                                           </Box>
                                       )}>
                                       {allTags.map(tag => <MenuItem key={tag.id} value={tag.id}>{tag.name}</MenuItem>)}
                                   </MuiSelect>
                               </FormControl>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 4 }} />

                        {/* --- Section 3: 食材列表 --- */}
                        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>食材列表</Typography>
                        {formData.ingredients_data.map((ing, index) => (
                            <Grid container spacing={1} key={index} alignItems="center" sx={{ mb: 1.5 }}>
                                <Grid item xs={12} sm={4}><Select options={ingredientOptions} placeholder="选择食材..." value={ingredientOptions.find(opt => opt.value === ing.ingredient_id)} onChange={selectedOption => handleIngredientChange(index, 'ingredient_id', selectedOption.value)} /></Grid>
                                <Grid item xs={6} sm={2}><TextField fullWidth type="number" label="用量" name="quantity" value={ing.quantity} onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)} /></Grid>
                                <Grid item xs={6} sm={2}>
                                    <FormControl fullWidth><InputLabel>单位</InputLabel><MuiSelect name="unit" label="单位" value={ing.unit} onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}>
                                        {UNIT_CHOICES.map(u => <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>)}
                                    </MuiSelect></FormControl>
                                </Grid>
                                <Grid item xs={10} sm={3}><TextField fullWidth label="备注 (如: 切碎)" name="notes" value={ing.notes} onChange={(e) => handleIngredientChange(index, 'notes', e.target.value)} /></Grid>
                                <Grid item xs={2} sm={1} sx={{textAlign: 'right'}}><IconButton onClick={() => removeIngredientField(index)} disabled={formData.ingredients_data.length <= 1}><RemoveCircleOutlineIcon color="error" /></IconButton></Grid>
                            </Grid>
                        ))}
                        <Button startIcon={<AddCircleOutlineIcon />} onClick={addIngredientField}>添加食材</Button>

                        <Divider sx={{ my: 4 }} />

                        {/* --- Section 4: 制作步骤 --- */}
                        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>制作步骤</Typography>
                        {formData.steps_data.map((step, index) => (
                            <Grid container spacing={1} key={index} alignItems="flex-start" sx={{ mb: 1.5 }}>
                                <Grid item><Typography sx={{ pt: 2, fontWeight: 'bold' }}>{step.step_number}.</Typography></Grid>
                                <Grid item xs><TextField fullWidth multiline label={`步骤描述`} name="description" value={step.description} onChange={(e) => handleStepChange(index, e)} /></Grid>
                                <Grid item><IconButton sx={{ mt: 1 }} onClick={() => removeStepField(index)} disabled={formData.steps_data.length <= 1}><RemoveCircleOutlineIcon color="error" /></IconButton></Grid>
                            </Grid>
                        ))}
                        <Button startIcon={<AddCircleOutlineIcon />} onClick={addStepField}>添加步骤</Button>
                        
                        {/* --- Section 5: 提交按钮 --- */}
                        <Box sx={{ mt: 5, textAlign: 'center' }}>
                            <Button type="submit" variant="contained" size="large" disabled={loading} sx={{minWidth: 200}}>
                                {loading ? <CircularProgress size={24} color="inherit" /> : (isEditing ? '更新菜谱' : '创建菜谱')}
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Fade>
    );
}

export default RecipeFormPage;