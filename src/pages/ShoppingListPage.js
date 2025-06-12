// src/pages/ShoppingListPage.js (替换为最终版本)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    getShoppingList, addShoppingListItem, deleteShoppingListItem,
    updateShoppingListItem, clearPurchasedItems, getAllIngredients
} from '../api/api';
import Select from 'react-select';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../context/NotificationContext';
import AddFromBrowserModal from '../components/AddFromBrowserModal';
import {
    Box, Typography, Button, List, ListItem, ListItemText, ListItemIcon,
    IconButton, Checkbox, CircularProgress, Alert, Paper, Fade, Divider,
    Accordion, AccordionSummary, AccordionDetails, ToggleButton, ToggleButtonGroup, Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

// --- Helper function to group items ---
const groupItems = (items, groupBy) => {
    const groups = items.reduce((acc, item) => {
        let key;
        if (groupBy === 'category') {
           key = item.ingredient_category_display || '🛒 其他/未分类';
        } else { // recipe
           key = item.related_recipe_title || '🔧 手动添加/其他';
        }
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(item);
        return acc;
    }, {});
    
   Object.values(groups).forEach(list => list.sort((a, b) => a.ingredient_name.localeCompare(b.ingredient_name)));
   return Object.entries(groups).sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
};

// --- Item Component ---
const ShoppingItem = React.memo(({ item, groupBy, onToggle, onDelete }) => (
    <motion.div
        key={item.id} layout initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
        style={{ width: '100%'}}
    >
        <ListItem sx={{ textDecoration: item.is_purchased ? 'line-through' : 'none', color: item.is_purchased ? 'text.disabled' : 'text.primary', py: 0.5 }}
            secondaryAction={ <IconButton edge="end" aria-label="delete" onClick={() => onDelete(item.id, item.ingredient_name)} size="small"><DeleteIcon fontSize="small" color={item.is_purchased ? "disabled" : "error"}/></IconButton> }
            disablePadding
        >
            <ListItemIcon sx={{minWidth: 'auto'}}><Checkbox edge="start" checked={item.is_purchased} onChange={() => onToggle(item)} tabIndex={-1} disableRipple size="small" color="success"/></ListItemIcon>
            <ListItemText
                primary={`${item.ingredient_name} ${item.quantity ? `- ${item.quantity} ${item.unit_display || item.unit}` : ''}`}
                secondary={groupBy === 'category' ? (item.related_recipe_title ? `来自: ${item.related_recipe_title}` : '手动添加') : (item.ingredient_category_display || '未分类')}
                primaryTypographyProps={{ variant: 'body1'}} secondaryTypographyProps={{ variant: 'caption'}}
            />
        </ListItem>
    </motion.div>
));

// --- Group Renderer Component ---
const RenderGroups = ({ groupedData, groupBy, onToggle, onDelete, icon: Icon, title }) => (
     <Box sx={{ mt: 3, width: '100%' }}>
       <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><Icon sx={{ mr: 1, color: 'text.secondary'}} /><Typography variant="h6">{title} ({groupedData.reduce((acc, [, items]) => acc + items.length, 0)})</Typography></Box>
        {groupedData.length === 0 && (<Typography color="text.secondary" sx={{ml: 4}}>空空如也...</Typography>)}
        {groupedData.map(([groupName, items]) => (
             <Accordion key={groupName} defaultExpanded={!items[0]?.is_purchased} elevation={1} sx={{ mb: 1, '&:before': { display: 'none' } }} >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} ><Typography sx={{ flexShrink: 0 }}>{groupName}</Typography><Chip label={`${items.length} 项`} size="small" sx={{ml: 1.5}} variant="outlined"/></AccordionSummary>
                <AccordionDetails sx={{paddingTop: 0}}><List disablePadding ><AnimatePresence>{items.map(item => (<ShoppingItem key={item.id} item={item} groupBy={groupBy} onToggle={onToggle} onDelete={onDelete}/>))}</AnimatePresence></List></AccordionDetails>
            </Accordion>
        ))}
    </Box>
);

// --- Main Page Component ---
function ShoppingListPage() {
    const [items, setItems] = useState([]);
    const [newItemId, setNewItemId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [allIngredients, setAllIngredients] = useState([]);
    const [addError, setAddError] = useState('');
    const { showNotification } = useNotification();
    const [groupBy, setGroupBy] = useState('category');
    const [isBrowserOpen, setIsBrowserOpen] = useState(false);

    useEffect(() => {
       const fetchIngredients = async () => {
            try {
                const res = await getAllIngredients();
                setAllIngredients(res.data || []);
            } catch (error) { console.error("Failed to fetch ingredients", error); }
        };
        fetchIngredients();
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getShoppingList();
            setItems(res.data?.results || res.data || []);
        } catch (error) {
             showNotification("获取购物清单失败", 'error');
         }
        setLoading(false);
    }, [showNotification]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const { toBuyItems, purchasedItems, existingItemIds } = useMemo(() => ({
       toBuyItems: items.filter(item => !item.is_purchased),
       purchasedItems: items.filter(item => item.is_purchased),
       existingItemIds: new Set(items.map(item => item.ingredient)),
    }), [items]);

    const groupedToBuy = useMemo(() => groupItems(toBuyItems, groupBy), [toBuyItems, groupBy]);
    const groupedPurchased = useMemo(() => groupItems(purchasedItems, groupBy), [purchasedItems, groupBy]);

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItemId) return;
        setIsAdding(true);
        try {
            if (existingItemIds.has(newItemId.value)) {
                setAddError('该食材已在清单中。'); setIsAdding(false); return;
            }
            await addShoppingListItem({ ingredient: newItemId.value }); 
            setNewItemId(null); setAddError(''); showNotification('已添加到购物清单', 'success'); fetchData(); 
        } catch (error) {
            setAddError(error.response?.data?.ingredient?.join(' ') ||'添加失败。'); showNotification('添加失败', 'error');
        } finally {
            setIsAdding(false);
        }
    };
    
    const handleBatchAdd = useCallback(async (ingredientIds) => {
        const idsToAdd = ingredientIds.filter(id => !existingItemIds.has(id));
        if (idsToAdd.length === 0) {
            showNotification('所有选中项均已在清单中。', 'info');
            return;
        }
        showNotification(`正在添加 ${idsToAdd.length} 项食材...`, 'info');
        const addPromises = idsToAdd.map(id => addShoppingListItem({ ingredient: id }));
        try {
            await Promise.all(addPromises);
            showNotification('批量添加成功！', 'success');
            fetchData();
        } catch (error) {
            showNotification('批量添加时发生错误。', 'error');
        }
    }, [existingItemIds, fetchData, showNotification]);

    const handleDeleteItem = useCallback(async (id, name) => {
        const originalItems = [...items];
        setItems(prev => prev.filter(item => item.id !== id));
        try {
            await deleteShoppingListItem(id);
            showNotification(`${name} 已移除。`, 'info');
        } catch (error) {
            showNotification(`移除 ${name} 失败！`, 'error');
            setItems(originalItems);
        }
    }, [items, showNotification]);

    const handleTogglePurchase = useCallback(async (item) => {
        const newStatus = !item.is_purchased;
        const originalItems = [...items];
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_purchased: newStatus } : i));
        try {
            await updateShoppingListItem(item.id, { is_purchased: newStatus });
            showNotification(`${item.ingredient_name} 已标记为${newStatus ? '已购买' : '待购买'}。`, 'info');
        } catch (error) {
            showNotification(`更新 ${item.ingredient_name} 状态失败！`, 'error');
            setItems(originalItems);
        }
    }, [items, showNotification]);

    const handleClearPurchased = useCallback(async () => {
        if (purchasedItems.length === 0) return;
        if (window.confirm('确定要清空所有已购买的商品吗？')) {
            const originalItems = [...items];
            setItems(prev => prev.filter(item => !item.is_purchased));
            try {
                await clearPurchasedItems();
                showNotification('已购买的商品已清空。', 'success');
            } catch (error) {
                showNotification('清空失败！', 'error');
                setItems(originalItems);
            }
        }
    }, [items, purchasedItems.length, showNotification]);
    
    const handleGroupByChange = (event, newGroupBy) => { if (newGroupBy !== null) setGroupBy(newGroupBy); };

    const ingredientOptions = allIngredients.map(ing => ({ value: ing.id, label: ing.name }));
    const selectStyles = { control: (p) => ({...p, minHeight: '56px', borderColor: 'rgba(0, 0, 0, 0.23)', '&:hover': { borderColor: 'rgba(0, 0, 0, 0.87)'}, boxShadow: 'none'}), menu: p => ({...p, zIndex: 9999}) };

    return (
        <>
            <AddFromBrowserModal
                open={isBrowserOpen}
                onClose={() => setIsBrowserOpen(false)}
                onAdd={handleBatchAdd}
                allIngredients={allIngredients}
                existingItemIds={existingItemIds}
            />
            <Fade in={true}>
                <Paper sx={{ p: {xs: 2, md: 3}, mt: 3, maxWidth: 900, margin: 'auto', minHeight: '70vh' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb:3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}><ShoppingCartIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} /><Typography variant="h4" >我的购物清单</Typography></Box>
                        <ToggleButtonGroup color="primary" value={groupBy} exclusive onChange={handleGroupByChange} aria-label="group by" size="small">
                            <ToggleButton value="category" aria-label="by category"><CategoryIcon sx={{mr:0.5}}/> 按分类</ToggleButton>
                            <ToggleButton value="recipe" aria-label="by recipe"><MenuBookIcon sx={{mr:0.5}}/> 按菜谱</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                    <Divider sx={{mb:3}}/>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'stretch' }}>
                        <Box sx={{ flexGrow: 1 }}><Select options={ingredientOptions} value={newItemId} onChange={setNewItemId} placeholder="快速添加单个食材..." isClearable styles={selectStyles} noOptionsMessage={() => "未找到"}/></Box>
                        <Button type="submit" variant="outlined" size="large" onClick={handleAddItem} disabled={!newItemId || isAdding} startIcon={!isAdding && <AddIcon/>} sx={{ height: '56px' }}>{isAdding ? <CircularProgress size={24} color="inherit"/> : '添加'}</Button>
                        <Button variant="contained" size="large" onClick={() => setIsBrowserOpen(true)} startIcon={<AddShoppingCartIcon />} sx={{ height: '56px', flexShrink: 0 }}>浏览添加</Button>
                    </Box>
                    {addError && <Alert severity="error" sx={{ mb: 2 }}>{addError}</Alert>}

                    {loading ? ( <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8}}><CircularProgress size={60}/></Box> ) : (
                        <>
                            <RenderGroups groupedData={groupedToBuy} groupBy={groupBy} onToggle={handleTogglePurchase} onDelete={handleDeleteItem} icon={ShoppingCartIcon} title="待购买" />
                            <Divider sx={{my: 5}}/>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems:'center', flexWrap: 'wrap', gap: 1}}>
                                <RenderGroups groupedData={groupedPurchased} groupBy={groupBy} onToggle={handleTogglePurchase} onDelete={handleDeleteItem} icon={CheckCircleIcon} title="已购买" />
                                {purchasedItems.length > 0 && (<Button variant="outlined" color="secondary" startIcon={<CleaningServicesIcon />} onClick={handleClearPurchased} sx={{ mb: 2, alignSelf: 'flex-start', ml:'auto' }}>清空已购买</Button>)}
                            </Box>
                        </>
                    )}
                </Paper>
            </Fade>
        </>
    );
}

export default ShoppingListPage;