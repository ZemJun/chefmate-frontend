// src/pages/InventoryPage.js (已修复)
import React, { useState, useEffect, useCallback } from 'react';
import { getInventory, addInventoryItem, deleteInventoryItem, getAllIngredients } from '../api/api';
import Select from 'react-select';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext'; //导入 useAuth
import {
    Box, Typography, Button, List, ListItem, ListItemText,
    IconButton, CircularProgress, Alert, Paper, Fade, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import KitchenIcon from '@mui/icons-material/Kitchen';

function InventoryPage() {
    const title = "我的食材库存";
    const [items, setItems] = useState([]);
    const [newItemId, setNewItemId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [allIngredients, setAllIngredients] = useState([]);
    const [addError, setAddError] = useState('');
    const { showNotification } = useNotification(); 
    const { user, loading: authLoading } = useAuth(); // 获取用户和认证加载状态

    useEffect(() => {
        // 只在认证流程结束后且用户已登录时获取食材列表
        if (!authLoading && user) {
            const fetchIngredients = async () => {
                try {
                    const res = await getAllIngredients();
                    const ingredients = res.data || [];
                    setAllIngredients(ingredients);
                } catch (error) { console.error("Failed to fetch ingredients", error); }
            };
            fetchIngredients();
        }
    }, [user, authLoading]); // 依赖认证状态和用户

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getInventory();
            setItems(res.data?.results || res.data || []);
        } catch (error) { 
            console.error(`Failed to fetch ${title}`, error); 
            // 只有在用户确实存在时才提示错误，避免登出时也提示
            if (user) {
                showNotification(`获取${title}失败`, 'error');
            }
        }
        setLoading(false);
    }, [showNotification, user]); // 依赖 user

    useEffect(() => {
        // 同样，只在认证流程结束后且用户已登录时获取库存
        if (!authLoading && user) {
            fetchData();
        } else if (!authLoading && !user) {
            // 如果认证结束但用户未登录，清空数据并停止加载
            setItems([]);
            setLoading(false);
        }
    }, [fetchData, user, authLoading]); // 关键依赖

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItemId) {
            setAddError('请选择一个食材。');
            return;
        }
        setAddError('');
        setIsAdding(true);
        try {
            if (items.some(item => item.ingredient === newItemId.value)) {
                setAddError('该食材已在库存中。');
                setIsAdding(false);
                return;
            }
            await addInventoryItem({ ingredient: newItemId.value });
            setNewItemId(null);
            showNotification('食材添加成功!', 'success');
            fetchData();
        } catch (error) {
            setAddError(error.response?.data?.ingredient?.join(' ') || '添加失败，请稍后再试。');
            showNotification('添加食材失败', 'error');
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteItem = async (id, name) => {
        const originalItems = [...items];
        setItems(prev => prev.filter(item => item.id !== id));
        try {
            await deleteInventoryItem(id);
            showNotification(`${name} 已移出库存。`, 'info');
        } catch (error) {
            console.error(`Failed to delete item from ${title}`, error);
            showNotification(`删除 ${name} 失败！`, 'error');
            setItems(originalItems); 
        }
    };
    
    const ingredientOptions = allIngredients.map(ing => ({ value: ing.id, label: ing.name }));
    const selectStyles = {
        control: (provided) => ({ ...provided, minHeight: '56px', borderColor: 'rgba(0, 0, 0, 0.23)', '&:hover': { borderColor: 'rgba(0, 0, 0, 0.87)' }, boxShadow: 'none' }),
        menu: (provided) => ({ ...provided, zIndex: 9999 }),
    };

    // 在认证信息加载时，显示一个全局加载动画
    if (authLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4}}><CircularProgress /></Box>;
    }
    
    // 如果认证结束但未登录，显示提示信息
    if (!user) {
        return <Alert severity="warning" sx={{mt: 4}}>请先登录以查看您的库存。</Alert>
    }

    return (
      <Fade in={true}>
        <Paper sx={{ p: {xs: 2, md: 3}, mt: 2, maxWidth: 800, margin: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2}}>
                <KitchenIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Typography variant="h4" >{title}</Typography>
            </Box>
            <Divider sx={{mb: 3}}/>

            <Box component="form" onSubmit={handleAddItem} sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'stretch' }}>
                <Box sx={{ flexGrow: 1 }}>
                    <Select 
                        options={ingredientOptions} value={newItemId} onChange={setNewItemId}
                        placeholder="搜索并选择要添加到库存的食材..." isClearable
                        styles={selectStyles} noOptionsMessage={() => "未找到匹配的食材"}
                    />
                </Box>
                <Button type="submit" variant="contained" size="large" startIcon={!isAdding && <AddIcon/>}
                    disabled={!newItemId || isAdding} sx={{ height: '56px', px: 3}}
                >
                    {isAdding ? <CircularProgress size={24} color="inherit"/> : '添加'}
                </Button>
            </Box>
            {addError && <Alert severity="error" sx={{ mb: 2 }}>{addError}</Alert>}

            {loading ? ( <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4}}><CircularProgress /></Box> ) : (
                <>
                <Typography variant="subtitle1" color="text.secondary" sx={{mb:1}}>当前库存 ({items.length})</Typography>
                <List sx={{maxHeight: '60vh', overflowY:'auto'}}>
                    <AnimatePresence>
                        {items.length > 0 ? (
                            items.map(item => (
                                <motion.div key={item.id} layout initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
                                >
                                    <Paper variant="outlined" sx={{ mb: 1, borderRadius:1}}>
                                        <ListItem
                                            secondaryAction={
                                                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteItem(item.id, item.ingredient_name)}>
                                                    <DeleteIcon color="error"/>
                                                </IconButton>
                                            }
                                        >
                                            <ListItemText primary={item.ingredient_name} secondary={item.notes}/>
                                        </ListItem>
                                    </Paper>
                                </motion.div>
                            ))
                        ) : (
                            <Typography color="text.secondary" align="center" sx={{mt:4}}>
                                您的库存是空的，快来添加食材吧！
                            </Typography>
                        )}
                    </AnimatePresence>
                </List>
                </>
            )}
        </Paper>
      </Fade>
    );
}
export default InventoryPage;