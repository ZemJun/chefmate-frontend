// src/pages/ProfilePage.js (修复后)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile, getDietaryTags, getAllIngredients } from '../api/api';
import { useApi } from '../hooks/useApi';

import {
    Container, Paper, Typography, Box, Grid, TextField, Button,
    CircularProgress, Alert, Autocomplete, Chip, Fade
} from '@mui/material';

function ProfilePage() {
    const { user, setUser, loading: authLoading } = useAuth();
    const { loading: isUpdating, error: updateError, request: submitProfileUpdate } = useApi(updateUserProfile);

    const [formData, setFormData] = useState({
        email: '', nickname: '', dietary_preferences: [], disliked_ingredients: [],
    });
    const [allTags, setAllTags] = useState([]);
    const [allIngredients, setAllIngredients] = useState([]);
    const [optionsLoading, setOptionsLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setOptionsLoading(true);
            try {
                const [tagsRes, ingredientsRes] = await Promise.all([getDietaryTags(), getAllIngredients()]);
                setAllTags(tagsRes.data.results || tagsRes.data);
                setAllIngredients(ingredientsRes.data.results || ingredientsRes.data);
            } catch (error) { console.error("Failed to fetch options", error); }
            finally { setOptionsLoading(false); }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (user) {
            setFormData({
                email: user.email || '', nickname: user.nickname || '',
                dietary_preferences: user.dietary_preferences || [],
                disliked_ingredients: user.disliked_ingredients || [],
            });
        }
    }, [user]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleAutocompleteChange = (field, newValue) => {
        const names = newValue.map(item => item.name);
        setFormData(prev => ({ ...prev, [field]: names }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const updatedUser = await submitProfileUpdate(formData);
            setUser(updatedUser);
            setMessage('个人资料更新成功！');
        } catch (error) {
            setMessage('更新失败，请检查输入。');
            console.error("Update profile failed", error);
        }
    };

    if (authLoading || optionsLoading) return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
    if (!user) return <p>请先登录以查看您的个人资料。</p>;

    return (
        <Fade in={true}>
        <Container maxWidth="lg"> {/* 稍微加宽容器 */}
            <Paper sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" gutterBottom>个人资料</Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>用户名: {user.username}</Typography>

                {message && <Alert severity={message.includes('成功') ? 'success' : 'error'} sx={{ mb: 2 }}>{message}</Alert>}
                {updateError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {Object.entries(updateError).map(([field, errors]) => (
                            <div key={field}>{field}: {Array.isArray(errors) ? errors.join(', ') : String(errors)}</div>
                        ))}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    {/* vvvvvvvvvv FIX vvvvvvvvvv */}
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
                            <TextField fullWidth label="邮箱" name="email" value={formData.email} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField fullWidth label="昵称" name="nickname" value={formData.nickname} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Autocomplete
                                multiple
                                id="dietary-preferences"
                                options={allTags}
                                getOptionLabel={(option) => option.name}
                                value={allTags.filter(tag => formData.dietary_preferences.includes(tag.name))}
                                onChange={(event, newValue) => handleAutocompleteChange('dietary_preferences', newValue)}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip variant="outlined" label={option.name} {...getTagProps({ index })} />
                                    ))
                                }
                                renderInput={(params) => (
                                    <TextField {...params} variant="outlined" label="饮食偏好" />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Autocomplete
                                multiple
                                id="disliked-ingredients"
                                options={allIngredients}
                                getOptionLabel={(option) => option.name}
                                value={allIngredients.filter(ing => formData.disliked_ingredients.includes(ing.name))}
                                onChange={(event, newValue) => handleAutocompleteChange('disliked_ingredients', newValue)}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip variant="outlined" label={option.name} {...getTagProps({ index })} />
                                    ))
                                }
                                renderInput={(params) => (
                                    <TextField {...params} variant="outlined" label="不吃的食材" />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
                            <Button type="submit" variant="contained" size="large" disabled={isUpdating}>
                                {isUpdating ? <CircularProgress size={24} /> : '保存更改'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
        </Fade>
    );
}

export default ProfilePage;