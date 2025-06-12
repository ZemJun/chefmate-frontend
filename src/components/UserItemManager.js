// src/components/UserItemManager.js (替换后的完整代码)

import React, { useState, useEffect, useCallback } from 'react';
import { getAllIngredients, clearPurchasedItems } from '../api/api';
import Select from 'react-select';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../context/NotificationContext'; // 导入通知 hook

import {
    Box, Typography, Button, List, ListItem, ListItemText,
    IconButton, Checkbox, CircularProgress, Alert, Paper, Fade
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';

function UserItemManager({ title, getItems, addItem, deleteItem, updateItem, showPurchaseStatus = false }) {
    const [items, setItems] = useState([]);
    const [newItemId, setNewItemId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [allIngredients, setAllIngredients] = useState([]);
    const [addError, setAddError] = useState('');
    const { showNotification } = useNotification(); // 获取通知函数

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
            setNewItemId(null);
            fetchData();
        } catch (error) {
            setAddError('添加失败，该食材可能已存在于列表中。');
            console.error(`Failed to add item to ${title}`, error);
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            setItems(prev => prev.filter(item => item.id !== id));
            await deleteItem(id);
        } catch (error) {
            console.error(`Failed to delete item from ${title}`, error);
            fetchData();
        }
    };

    const handleTogglePurchase = async (item) => {
        if (!updateItem) return;
        const originalItems = [...items];
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_purchased: !i.is_purchased } : i));
        try {
            await updateItem(item.id, { is_purchased: !item.is_purchased });
        } catch (error) {
            console.error(`Failed to update item in ${title}`, error);
            setItems(originalItems);
        }
    };

    const handleClearPurchased = async () => {
        if (window.confirm('确定要清空所有已购买的商品吗？')) {
            try {
                setItems(prev => prev.filter(item => !item.is_purchased));
                await clearPurchasedItems();
                showNotification('已购买的商品已清空。', 'info');
            } catch (error) {
                console.error('Failed to clear purchased items', error);
                showNotification('清空失败！', 'error');
                fetchData();
            }
        }
    };

    const ingredientOptions = allIngredients.map(ing => ({ value: ing.id, label: ing.name }));

    return (
      <Fade in={true}>
        <Paper sx={{ p: 3, mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" gutterBottom>{title}</Typography>
                {showPurchaseStatus && items.some(item => item.is_purchased) && (
                    <Button 
                        variant="outlined" 
                        color="secondary" 
                        startIcon={<CleaningServicesIcon />}
                        onClick={handleClearPurchased}
                    >
                        清空已购买
                    </Button>
                )}
            </Box>

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
                                    layout
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