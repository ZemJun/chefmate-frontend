// src/components/IngredientBrowser.js (新文件)

import React, { useState, useEffect, useMemo } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, Box, Accordion, AccordionSummary, AccordionDetails,
    Typography, List, ListItem, Checkbox, FormControlLabel, CircularProgress,
    InputAdornment
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';

function IngredientBrowser({ open, onClose, onAdd, existingItemIds = new Set() }) {
    const [allIngredients, setAllIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState(new Set());

    // 当弹窗打开时，获取所有食材
    useEffect(() => {
        if (open) {
            // 在每次打开时重置状态
            setLoading(true);
            setSelectedIds(new Set());
            setSearchTerm('');
            
            // 你的 getAllIngredients API 应该在后端被修改为不分页
            // 这里我们假设它返回一个包含所有食材的数组
            import('../api/api').then(api => {
                api.getAllIngredients()
                    .then(response => {
                        setAllIngredients(response.data || []);
                    })
                    .catch(error => console.error("Failed to fetch all ingredients", error))
                    .finally(() => setLoading(false));
            });
        }
    }, [open]);

    const handleToggleSelect = (id) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleAddClick = () => {
        onAdd(Array.from(selectedIds));
        onClose();
    };
    
    // 使用 useMemo 对食材进行分组和筛选，以提高性能
    const filteredAndGroupedIngredients = useMemo(() => {
        const filtered = allIngredients.filter(ing => 
            ing.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const grouped = filtered.reduce((acc, ing) => {
            const category = ing.category_display || '其他';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(ing);
            return acc;
        }, {});
        
        return Object.entries(grouped).sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
    }, [allIngredients, searchTerm]);
    
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>浏览并添加食材</DialogTitle>
            <DialogContent dividers>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="按名称搜索食材..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
                
                {loading ? <CircularProgress /> : (
                    <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        {filteredAndGroupedIngredients.map(([category, ingredients]) => (
                            <Accordion key={category} defaultExpanded>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography>{category} ({ingredients.length})</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <List dense>
                                        {ingredients.map(ing => (
                                            <ListItem key={ing.id} dense disablePadding>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={selectedIds.has(ing.id)}
                                                            onChange={() => handleToggleSelect(ing.id)}
                                                            disabled={existingItemIds.has(ing.id)}
                                                        />
                                                    }
                                                    label={ing.name}
                                                    sx={{width: '100%'}}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>取消</Button>
                <Button 
                    onClick={handleAddClick} 
                    variant="contained" 
                    disabled={selectedIds.size === 0}
                >
                    添加 {selectedIds.size > 0 ? `(${selectedIds.size})` : ''} 项到清单
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default IngredientBrowser;