// src/api/api.js
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

export const favoriteRecipe = (id) => apiClient.post(`/recipes/recipes/${id}/favorite/`);
export const unfavoriteRecipe = (id) => apiClient.delete(`/recipes/recipes/${id}/favorite/`);

// --- 用户认证相关 API ---
export const registerUser = (userData) => apiClient.post('/users/register/', userData);
export const loginUser = (credentials) => apiClient.post('/users/login/', credentials);
export const getUserProfile = () => apiClient.get('/users/profile/');
export const updateUserProfile = (profileData) => apiClient.put('/users/profile/', profileData);


// --- 菜谱相关 API ---
export const getRecipes = (params) => apiClient.get('/recipes/recipes/', { params });
export const getRecipeDetail = (id) => apiClient.get(`/recipes/recipes/${id}/`);
export const addRecipeToShoppingList = (id) => apiClient.post(`/recipes/recipes/${id}/add_to_shopping_list/`);

export const createRecipe = (formData) => apiClient.post('/recipes/recipes/', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const updateRecipe = (id, formData) => apiClient.patch(`/recipes/recipes/${id}/`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const deleteRecipe = (id) => apiClient.delete(`/recipes/recipes/${id}/`);

// --- vvvvvvvvvv 获取所有标签和食材用于选择 vvvvvvvvvv
export const getDietaryTags = () => apiClient.get('/recipes/dietary-tags/');
export const getAllIngredients = () => apiClient.get('/recipes/ingredients/');

// --- 用户个人数据相关 API ---
export const getInventory = () => apiClient.get('/users/inventory/');
export const addInventoryItem = (data) => apiClient.post('/users/inventory/', data);
export const deleteInventoryItem = (id) => apiClient.delete(`/users/inventory/${id}/`);

export const getShoppingList = (params = {}) => apiClient.get('/users/shopping-list/', { params });
export const addShoppingListItem = (data) => apiClient.post('/users/shopping-list/', data);
export const updateShoppingListItem = (id, data) => apiClient.patch(`/users/shopping-list/${id}/`, data); // 用PATCH更新购买状态
export const deleteShoppingListItem = (id) => apiClient.delete(`/users/shopping-list/${id}/`);

// --- 评价相关 API ---
export const getReviewsForRecipe = (recipeId) => apiClient.get(`/recipes/recipes/${recipeId}/reviews/`);
export const addReviewForRecipe = (recipeId, reviewData) => apiClient.post(`/recipes/recipes/${recipeId}/reviews/`, reviewData);


export default apiClient;