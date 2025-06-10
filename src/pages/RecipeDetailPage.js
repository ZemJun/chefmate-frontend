// src/pages/RecipeDetailPage.js

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRecipeDetail, addRecipeToShoppingList } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useFavorite } from '../hooks/useFavorite'; // <-- 导入自定义 Hook
import ReviewSection from '../components/ReviewSection';

function RecipeDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  
  // 使用一个本地 state 来存储从 API 获取的原始数据
  const [initialRecipe, setInitialRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 将获取到的原始数据传递给 useFavorite Hook
  const { recipe, toggleFavorite } = useFavorite(initialRecipe);

  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getRecipeDetail(id);
        setInitialRecipe(response.data);
      } catch (err) {
        setError('获取菜谱详情失败。');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  const handleAddToShoppingList = async () => {
    try {
      const response = await addRecipeToShoppingList(id);
      alert(response.data.detail);
    } catch (err) {
      if (err.response && err.response.data.detail) {
        alert(`操作失败: ${err.response.data.detail}`);
      } else {
        alert('添加到购物清单失败，请稍后再试。');
      }
      console.error(err);
    }
  };

  if (loading) return <p>正在加载...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!recipe) return <p>未找到该菜谱。</p>;

  return (
    <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px' }}>
      <img 
        src={recipe.main_image || 'https://via.placeholder.com/600x400.png?text=No+Image'} 
        alt={recipe.title} 
        style={{ width: '100%', borderRadius: '8px' }}
      />
      <h1>{recipe.title}</h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '10px 0' }}>
        {user && user.username === recipe.author_username && (
          <Link to={`/recipes/${id}/edit`}>
            <button>编辑菜谱</button>
          </Link>
        )}
        {user && (
          <button onClick={handleAddToShoppingList}>一键加入购物清单</button>
        )}
        {user && (
          <button onClick={toggleFavorite} style={{ fontSize: '16px' }}>
            {recipe.is_favorited ? '❤️ 已收藏' : '🤍 收藏'}
          </button>
        )}
      </div>

      <p>作者: {recipe.author_username || '匿名'} | 更新于: {new Date(recipe.updated_at).toLocaleDateString()}</p>
      
      <h3>简介</h3>
      <p>{recipe.description || '暂无简介'}</p>

      <h3>所需食材</h3>
      <ul>
        {recipe.recipe_ingredients.map(item => (
          <li key={item.ingredient_id}>
            {item.ingredient_name}: {item.quantity} {item.unit}
            {item.notes && <span> ({item.notes})</span>}
          </li>
        ))}
      </ul>
      
      <h3>制作步骤</h3>
      {recipe.steps && recipe.steps.length > 0 ? (
        <ol>
          {recipe.steps.map(step => (
            <li key={step.id} style={{ marginBottom: '15px' }}>
              <p>{step.description}</p>
              {step.image && <img src={step.image} alt={`步骤 ${step.step_number}`} style={{maxWidth: '200px', borderRadius: '4px'}}/>}
            </li>
          ))}
        </ol>
      ) : (
        <p>暂无详细步骤。</p>
      )}

      <ReviewSection recipeId={id} />
    </div>
  );
}

export default RecipeDetailPage;