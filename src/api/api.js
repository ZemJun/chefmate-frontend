// src/api/api.js (最终版)

import axios from 'axios';

// 创建一个axios实例，并设置基础URL
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // 你的Django后端API地址
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加一个请求拦截器，在每个请求的header中附加JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const favoriteRecipe = (id) => apiClient.post(`/recipes/${id}/favorite/`);
export const unfavoriteRecipe = (id) => apiClient.delete(`/recipes/${id}/favorite/`);

// --- 用户认证相关 API ---
export const registerUser = (userData) => apiClient.post('/users/register/', userData);
export const loginUser = (credentials) => apiClient.post('/users/login/', credentials);
export const getUserProfile = () => apiClient.get('/users/profile/');
export const updateUserProfile = (profileData) => apiClient.put('/users/profile/', profileData);


// --- 菜谱相关 API ---
export const getRecipes = (params) => apiClient.get('/recipes/', { params });
export const getRecipeDetail = (id) => apiClient.get(`/recipes/${id}/`); 
export const addRecipeToShoppingList = (id) => apiClient.post(`/recipes/${id}/add_to_shopping_list/`);

export const getSimpleRecipeList = () => apiClient.get('/recipes/simple-list/');

export const createRecipe = (formData) => apiClient.post('/recipes/', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const updateRecipe = (id, formData) => apiClient.patch(`/recipes/${id}/`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const deleteRecipe = (id) => apiClient.delete(`/recipes/${id}/`);
export const getFavoriteRecipes = () => apiClient.get('/recipes/favorites/');


// --- 获取所有标签和食材 ---
export const getDietaryTags = () => apiClient.get('/dietary-tags/'); 
export const getAllIngredients = () => apiClient.get('/ingredients/'); 

// --- 用户个人数据相关 API ---
export const getInventory = () => apiClient.get('/users/inventory/');
export const addInventoryItem = (data) => apiClient.post('/users/inventory/', data);
export const deleteInventoryItem = (id) => apiClient.delete(`/users/inventory/${id}/`);

export const getShoppingList = (params = {}) => apiClient.get('/users/shopping-list/', { params });
export const addShoppingListItem = (data) => apiClient.post('/users/shopping-list/', data);
export const updateShoppingListItem = (id, data) => apiClient.patch(`/users/shopping-list/${id}/`, data);
export const deleteShoppingListItem = (id) => apiClient.delete(`/users/shopping-list/${id}/`);
export const clearPurchasedItems = () => apiClient.delete('/users/shopping-list/clear_purchased/');


// --- 评价相关 API ---
export const getReviewsForRecipe = (recipeId) => apiClient.get(`/recipes/${recipeId}/reviews/`);
export const addReviewForRecipe = (recipeId, reviewData) => apiClient.post(`/recipes/${recipeId}/reviews/`, reviewData);
export const updateReview = (recipeId, reviewId, reviewData) => apiClient.patch(`/recipes/${recipeId}/reviews/${reviewId}/`, reviewData);
export const deleteReview = (recipeId, reviewId) => apiClient.delete(`/recipes/${recipeId}/reviews/${reviewId}/`);


export default apiClient;