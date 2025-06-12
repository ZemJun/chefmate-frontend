// src/pages/HomePage.js (最终美化版)
import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getRecipes } from '../api/api';
import RecipeCard from '../components/RecipeCard';
import {
    Box, Button, Typography, Container, Paper, Fade, Grid, Icon, CircularProgress
} from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import KitchenIcon from '@mui/icons-material/Kitchen';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { motion } from 'framer-motion';

// 动画变体
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

const featureCards = [
    {
        icon: <KitchenIcon fontSize="large" color="primary" />,
        title: "智能库存",
        description: "轻松管理您的食材，永不过期。",
        link: "/inventory"
    },
    {
        icon: <ShoppingCartIcon fontSize="large" color="primary" />,
        title: "购物清单",
        description: "一键从菜谱生成清单，购物不再遗漏。",
        link: "/shopping-list"
    },
    {
        icon: <FavoriteIcon fontSize="large" color="primary" />,
        title: "我的收藏",
        description: "收藏您喜爱的菜谱，随时查看。",
        link: "/my-favorites"
    }
];

function HomePage() {
    const [latestRecipes, setLatestRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLatest = async () => {
            try {
                // 获取最新的4个菜谱
                const res = await getRecipes({ page_size: 4, ordering: '-created_at' });
                setLatestRecipes(res.data.results || []);
            } catch (error) {
                console.error("Failed to fetch latest recipes", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLatest();
    }, []);

    return (
        <Fade in={true} timeout={500}>
            <Container maxWidth="lg" sx={{ pb: 4 }}>
                {/* 1. 英雄区 */}
                <Paper 
                    component={motion.div} variants={itemVariants}
                    elevation={0}
                    sx={{
                        mt: 4, mb: 6, p: { xs: 3, md: 8 },
                        textAlign: 'center',
                        borderRadius: 4,
                        color: 'white',
                        background: 'linear-gradient(45deg, #2e7d32 30%, #4caf50 90%)',
                    }}
                >
                    <RestaurantMenuIcon sx={{ fontSize: 60, mb: 2 }} />
                    <Typography component="h1" variant="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                        欢迎来到 ChefMate AI
                    </Typography>
                    <Typography variant="h5" color="inherit" paragraph>
                        你的个性化菜谱生成与智能购物清单助手。
                    </Typography>
                    <Button
                        component={RouterLink} to="/recipes"
                        variant="contained" size="large" endIcon={<ArrowForwardIcon />}
                        sx={{ mt: 2, bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: '#f1f1f1' } }}
                    >
                        开始探索菜谱
                    </Button>
                </Paper>

                {/* 2. 功能亮点 */}
                <Box 
                    component={motion.div} 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    sx={{ my: 6 }}
                >
                    <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ fontWeight: 600, mb: 4 }}>
                        核心功能
                    </Typography>
                    <Grid container spacing={4} justifyContent="center">
                        {featureCards.map((card) => (
                            <Grid item xs={12} sm={6} md={4} key={card.title} component={motion.div} variants={itemVariants}>
                                <Paper sx={{ p: 3, height: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Icon sx={{ fontSize: 50, mb: 2 }}>{card.icon}</Icon>
                                    <Typography variant="h6" gutterBottom>{card.title}</Typography>
                                    <Typography color="text.secondary" sx={{ flexGrow: 1 }}>{card.description}</Typography>
                                    <Button component={RouterLink} to={card.link} sx={{ mt: 2 }}>了解更多</Button>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* 3. 最新菜谱 */}
                <Box 
                    component={motion.div} 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    sx={{ my: 6 }}
                >
                    <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ fontWeight: 600, mb: 4 }}>
                        最新菜谱
                    </Typography>
                    {loading ? <CircularProgress sx={{ display: 'block', margin: 'auto' }} /> : (
                        <Grid container spacing={3} justifyContent="center">
                            {latestRecipes.map(recipe => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={recipe.id} component={motion.div} variants={itemVariants}>
                                    <RecipeCard recipe={recipe} />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            </Container>
        </Fade>
    );
}

export default HomePage;