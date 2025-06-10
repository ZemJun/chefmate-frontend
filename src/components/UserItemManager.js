import React, { useState, useEffect, useCallback  } from 'react';
import { getAllIngredients } from '../api/api';

function UserItemManager({ title, getItems, addItem, deleteItem, updateItem, showPurchaseStatus = false }) {
  const [items, setItems] = useState([]);
  const [newItemId, setNewItemId] = useState('');
  const [loading, setLoading] = useState(true);
  const [allIngredients, setAllIngredients] = useState([]);

  // 获取所有可选食材
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const res = await getAllIngredients();
        setAllIngredients(res.data.results || res.data);
      } catch (error) {
        console.error("Failed to fetch ingredients", error);
      }
    };
    fetchIngredients();
  }, []);
  
  // 使用 useCallback 来包装 fetchData，以便在 useEffect 的依赖项中使用
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getItems();
      setItems(res.data.results || res.data);
    } catch (error) {
      console.error(`Failed to fetch ${title}`, error);
    }
    setLoading(false);
  }, [getItems, title]); // 依赖于 getItems 和 title
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemId) return;
    try {
      // 添加库存时，只传递 ingredient ID
      // 添加购物清单时，也可以只传 ID，后端可以设置默认数量和单位
      await addItem({ ingredient: newItemId });
      setNewItemId('');
      fetchData(); // 重新获取列表
    } catch (error) {
      console.error(`Failed to add item to ${title}`, error);
      alert('添加失败，可能已存在。');
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('确定要删除吗？')) {
      try {
        await deleteItem(id);
        fetchData(); // 重新获取列表
      } catch (error) {
        console.error(`Failed to delete item from ${title}`, error);
      }
    }
  };
  
  const handleTogglePurchase = async (item) => {
    if (!updateItem) return;
    try {
      await updateItem(item.id, { is_purchased: !item.is_purchased });
      fetchData();
    } catch (error)
    {
      console.error(`Failed to update item in ${title}`, error);
    }
  };

  if (loading) return <p>正在加载 {title}...</p>;

  return (
    <div>
      <h2>{title}</h2>
      <form onSubmit={handleAddItem}>
        <select value={newItemId} onChange={(e) => setNewItemId(e.target.value)}>
          <option value="">选择要添加的食材</option>
          {allIngredients.map(ing => (
            <option key={ing.id} value={ing.id}>{ing.name}</option>
          ))}
        </select>
        <button type="submit">添加</button>
      </form>
      
      {items.length > 0 ? (
        <ul>
          {items.map(item => (
            <li key={item.id} style={{ margin: '8px 0' }}>
              {showPurchaseStatus && (
                <input 
                  type="checkbox" 
                  checked={item.is_purchased}
                  onChange={() => handleTogglePurchase(item)}
                  style={{ marginRight: '8px' }}
                />
              )}
              <span style={{ textDecoration: item.is_purchased ? 'line-through' : 'none' }}>
                {item.ingredient_name}
                {/* 如果是购物清单项，并且有数量，就显示数量和单位 */}
                {showPurchaseStatus && item.quantity && (
                  <span style={{ color: '#666', marginLeft: '10px' }}>
                    ({item.quantity} {item.unit})
                  </span>
                )}
              </span>
              <button onClick={() => handleDeleteItem(item.id)} style={{ marginLeft: '10px' }}>删除</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>列表是空的。</p>
      )}
    </div>
  );
}

export default UserItemManager;