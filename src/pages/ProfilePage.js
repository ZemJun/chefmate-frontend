// src/pages/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile, getDietaryTags, getAllIngredients } from '../api/api';

function ProfilePage() {
  const { user, setUser, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    nickname: '',
    dietary_preferences: [],
    disliked_ingredients: [],
  });
  const [allTags, setAllTags] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // 初始化，获取所有可选标签和食材
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tagsRes, ingredientsRes] = await Promise.all([
          getDietaryTags(),
          getAllIngredients(),
        ]);
        setAllTags(tagsRes.data);
        // 为了性能，食材列表可能非常大，这里可以考虑使用支持搜索的选择框组件
        setAllIngredients(ingredientsRes.data.results || ingredientsRes.data);
      } catch (error) {
        console.error("Failed to fetch options", error);
      }
    };
    fetchData();
  }, []);

  // 当用户信息加载完毕后，填充表单
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        nickname: user.nickname || '',
        // SlugRelatedField 在后端接收的是名称列表
        dietary_preferences: user.dietary_preferences || [],
        disliked_ingredients: user.disliked_ingredients || [],
      });
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleMultiSelectChange = (e, field) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({ ...formData, [field]: selectedOptions });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await updateUserProfile(formData);
      setUser(response.data); // 更新全局用户状态
      setMessage('个人资料更新成功！');
    } catch (error) {
      console.error("Update profile failed", error);
      setMessage('更新失败，请检查输入或稍后再试。');
    }
  };

  if (authLoading || loading) return <p>正在加载您的个人资料...</p>;
  if (!user) return <p>请先登录以查看您的个人资料。</p>;

  return (
    <div>
      <h2>个人资料</h2>
      <p>用户名: {user.username} (不可修改)</p>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>邮箱:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} />
        </div>
        <div>
          <label>昵称:</label>
          <input type="text" name="nickname" value={formData.nickname} onChange={handleChange} />
        </div>
        <div>
          <label>饮食偏好:</label>
          <select 
            multiple 
            name="dietary_preferences" 
            value={formData.dietary_preferences}
            onChange={(e) => handleMultiSelectChange(e, 'dietary_preferences')}
            size="5"
          >
            {allTags.map(tag => <option key={tag.name} value={tag.name}>{tag.name}</option>)}
          </select>
        </div>
        <div>
          <label>不吃的食材:</label>
          {/* 对于大量选项，更好的UI是带搜索功能的多选框 (e.g., react-select) */}
          <select 
            multiple 
            name="disliked_ingredients" 
            value={formData.disliked_ingredients}
            onChange={(e) => handleMultiSelectChange(e, 'disliked_ingredients')}
            size="8"
          >
            {allIngredients.map(ing => <option key={ing.name} value={ing.name}>{ing.name}</option>)}
          </select>
        </div>
        <button type="submit">保存更改</button>
      </form>
    </div>
  );
}

export default ProfilePage;