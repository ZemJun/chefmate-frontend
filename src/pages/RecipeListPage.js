import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getRecipes, getDietaryTags, getInventory } from '../api/api';
import RecipeCard from '../components/RecipeCard';
import { useAuth } from '../context/AuthContext';

const listContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
};

const filterSectionStyle = {
  padding: '20px',
  margin: '20px 0',
  border: '1px solid #ddd',
  borderRadius: '8px',
  backgroundColor: '#f9f9f9',
};

function RecipeListPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    search: '',
    cooking_time_minutes__lte: '',
    difficulty: '',
    cuisine_type__icontains: '',
    dietary_tags__name__in: [],
    available_ingredients: '',
  });
  
  const [allTags, setAllTags] = useState([]);
  const [userInventory, setUserInventory] = useState([]);
  const [selectedInventoryForSearch, setSelectedInventoryForSearch] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    getDietaryTags().then(res => setAllTags(res.data.results || res.data)).catch(err => console.error(err));
    if (user) {
      getInventory().then(res => setUserInventory(res.data.results || res.data)).catch(err => console.error(err));
    } else {
      setUserInventory([]);
    }
  }, [user]);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    setError('');
    
    const activeFilters = {};
    for (const key in filters) {
      const value = filters[key];
      if (value !== null && value !== '' && value.length !== 0) {
        if (Array.isArray(value)) {
          activeFilters[key] = value.join(',');
        } else {
          activeFilters[key] = value;
        }
      }
    }
    
    try {
      const response = await getRecipes(activeFilters);
      setRecipes(response.data.results || []);
    } catch (err) {
      setError('获取菜谱失败，请稍后再试。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecipes();
    }, 500);

    return () => clearTimeout(timer);
  }, [fetchRecipes]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleTagChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFilters(prev => ({ ...prev, dietary_tags__name__in: selectedOptions }));
  };
  
  const handleResetFilters = () => {
    setSelectedInventoryForSearch([]);
    setFilters({
      search: '',
      cooking_time_minutes__lte: '',
      difficulty: '',
      cuisine_type__icontains: '',
      dietary_tags__name__in: [],
      available_ingredients: '',
    });
  };
  
  const handleInventorySelectChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedInventoryForSearch(prev => [...prev, value]);
    } else {
      setSelectedInventoryForSearch(prev => prev.filter(id => id !== value));
    }
  };
  
  const handleSmartSearch = () => {
    // VVVVVV  这里是针对问题2的优化 VVVVVV
    // 只有在用户确实选择了食材时才设置过滤器
    // 否则，确保该过滤器为空，这样就不会影响其他过滤条件
    const newAvailableIngredients = selectedInventoryForSearch.join(',');
    if (filters.available_ingredients !== newAvailableIngredients) {
        setFilters(prev => ({
            ...prev,
            available_ingredients: newAvailableIngredients,
        }));
    }
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  };

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>所有菜谱</h2>
      {user && (
          <Link to="/recipes/new" style={{ marginRight: '20px' }}>
              <button>创建新菜谱</button>
          </Link>
      )}
      <button onClick={handleResetFilters}>重置所有筛选</button>
      
      <div style={filterSectionStyle}>
        <h3>筛选菜谱</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          <input 
            type="text" 
            name="search"
            placeholder="按名称或描述搜索..."
            value={filters.search}
            onChange={handleFilterChange}
            style={{flex: '1 1 200px'}}
          />
          <input 
            type="number"
            name="cooking_time_minutes__lte"
            placeholder="最长烹饪时间(分钟)"
            value={filters.cooking_time_minutes__lte}
            onChange={handleFilterChange}
            style={{flex: '1 1 200px'}}
          />
          <select name="difficulty" value={filters.difficulty} onChange={handleFilterChange} style={{flex: '1 1 150px'}}>
            <option value="">所有难度</option>
            <option value="1">简单</option>
            <option value="2">中等</option>
            <option value="3">困难</option>
          </select>
          <input 
            type="text"
            name="cuisine_type__icontains"
            placeholder="菜系 (如: 川菜)"
            value={filters.cuisine_type__icontains}
            onChange={handleFilterChange}
            style={{flex: '1 1 200px'}}
          />
          <select multiple size="5" onChange={handleTagChange} value={filters.dietary_tags__name__in} style={{flex: '1 1 200px'}}>
             {allTags.map(tag => <option key={tag.id} value={tag.name}>{tag.name}</option>)}
          </select>
        </div>
      </div>
      
      {user && userInventory.length > 0 && (
        <div style={filterSectionStyle}>
          <h3>根据我的库存推荐</h3>
          <p>勾选你拥有的食材：</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', maxHeight: '150px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
            {userInventory.map(item => (
              <div key={item.id}>
                {/* VVVVVV 这里现在可以正常工作了，因为后端会返回 item.ingredient VVVVVV */}
                <input 
                  type="checkbox"
                  id={`inv-item-${item.ingredient}`}
                  value={item.ingredient}
                  onChange={handleInventorySelectChange}
                  checked={selectedInventoryForSearch.includes(String(item.ingredient))}
                />
                <label htmlFor={`inv-item-${item.ingredient}`}>{item.ingredient_name}</label>
              </div>
            ))}
          </div>
          <button onClick={handleSmartSearch} style={{marginTop: '10px'}}>开始智能推荐</button>
        </div>
      )}
      
      {loading ? <p>正在加载菜谱...</p> : (
        <div style={listContainerStyle}>
          {recipes.length > 0 ? (
            recipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)
          ) : (
            <p>没有找到符合条件的菜谱。</p>
          )}
        </div>
      )}
    </div>
  );
}

export default RecipeListPage;