// src/components/UserItemManager.js (修改后)
import React, { useState, useEffect, useCallback } from 'react';
import { getAllIngredients } from '../api/api';
import Select from 'react-select'; // 使用 react-select 提升体验
import { motion, AnimatePresence } from 'framer-motion'; // 导入动画库

// 导入 MUI 组件
import {
    Box, Typography, Button, List, ListItem, ListItemText,
    IconButton, Checkbox, CircularProgress, Alert, Paper, Fade
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function UserItemManager({ title, getItems, addItem, deleteItem, updateItem, showPurchaseStatus = false }) {
    const [items, setItems] = useState([]);
    const [newItemId, setNewItemId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [allIngredients, setAllIngredients] = useState([]);
    const [addError, setAddError] = useState('');

    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                const res = await getAllIngredients();
                setAllIngredients(res.data.results || res.data);
            } catch (error) { console.error("Failed to fetch ingredients", error); }
        };
        fetchIngredients();
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getItems();
            setItems(res.data.results || res.data);
        } catch (error) { console.error(`Failed to fetch ${title}`, error); }
        setLoading(false);
    }, [getItems, title]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItemId) return;
        setAddError('');
        try {
            await addItem({ ingredient: newItemId.value });
            setNewItemId(null); // 清空 react-select
            fetchData();
        } catch (error) {
            setAddError('添加失败，该食材可能已存在于列表中。');
            console.error(`Failed to add item to ${title}`, error);
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            // 先在UI上移除，提供即时反馈
            setItems(prev => prev.filter(item => item.id !== id));
            await deleteItem(id);
        } catch (error) {
            console.error(`Failed to delete item from ${title}`, error);
            fetchData(); // 如果删除失败，则重新获取以恢复状态
        }
    };

    const handleTogglePurchase = async (item) => {
        if (!updateItem) return;
        const originalItems = [...items];
        // UI即时更新
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_purchased: !i.is_purchased } : i));
        try {
            await updateItem(item.id, { is_purchased: !item.is_purchased });
        } catch (error) {
            console.error(`Failed to update item in ${title}`, error);
            setItems(originalItems); // 更新失败则恢复
        }
    };

    const ingredientOptions = allIngredients.map(ing => ({ value: ing.id, label: ing.name }));

    return (
      <Fade in={true}>
        <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h5" gutterBottom>{title}</Typography>
            <Box component="form" onSubmit={handleAddItem} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                <Box sx={{ flexGrow: 1 }}>
                    <Select options={ingredientOptions} value={newItemId} onChange={setNewItemId} placeholder="选择要添加的食材..." />
                </Box>
                <Button type="submit" variant="contained">添加</Button>
            </Box>
            {addError && <Alert severity="error" sx={{ mb: 2 }}>{addError}</Alert>}

            {loading ? <CircularProgress /> : (
                <List>
                    <AnimatePresence>
                        {items.length > 0 ? (
                            items.map(item => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 50, transition: { duration: 0.3 } }}
                                    layout // 这会让列表在增删时平滑移动
                                >
                                    <ListItem
                                        secondaryAction={
                                            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteItem(item.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        }
                                        sx={{ bgcolor: 'background.default', mb: 1, borderRadius: 1 }}
                                    >
                                        {showPurchaseStatus && (
                                            <Checkbox
                                                edge="start"
                                                checked={item.is_purchased}
                                                onChange={() => handleTogglePurchase(item)}
                                                tabIndex={-1}
                                                disableRipple
                                            />
                                        )}
                                        <ListItemText
                                            primary={item.ingredient_name}
                                            secondary={showPurchaseStatus && item.quantity ? `${item.quantity} ${item.unit}` : null}
                                            sx={{ textDecoration: item.is_purchased ? 'line-through' : 'none' }}
                                        />
                                    </ListItem>
                                </motion.div>
                            ))
                        ) : (
                            <Typography color="text.secondary">列表是空的。</Typography>
                        )}
                    </AnimatePresence>
                </List>
            )}
        </Paper>
      </Fade>
    );
}

export default UserItemManager;