import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createRecipe, updateRecipe, getRecipeDetail, getAllIngredients, getDietaryTags } from '../api/api';

// 将常量定义在组件外部，避免不必要的重渲染
const UNIT_CHOICES = [
    { value: 'g', label: '克 (g)' },
    { value: 'kg', label: '千克 (kg)' },
    { value: 'ml', label: '毫升 (ml)' },
    { value: 'l', label: '升 (l)' },
    { value: 'tsp', label: '茶匙 (tsp)' },
    { value: 'tbsp', label: '汤匙 (tbsp)' },
    { value: 'cup', label: '杯 (cup)' },
    { value: 'piece', label: '个/只/颗' },
    { value: 'slice', label: '片' },
    { value: 'pinch', label: '撮' },
    { value: 'dash', label: '少量/几滴' },
    { value: 'to_taste', label: '适量' },
];

function RecipeFormPage() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cooking_time_minutes: 30,
    difficulty: 1,
    cuisine_type: '',
    main_image: null,
    dietary_tags: [],
    ingredients_data: [{ ingredient_id: '', quantity: 1, unit: 'g', notes: '' }],
    steps_data: [{ step_number: 1, description: '' }],
  });

  const [imageFile, setImageFile] = useState(null);
  const [allIngredients, setAllIngredients] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    
    const optionsPromise = Promise.all([
      getAllIngredients(),
      getDietaryTags()
    ]).then(([ingredientsRes, tagsRes]) => {
      setAllIngredients(ingredientsRes.data.results || ingredientsRes.data);
      setAllTags(tagsRes.data.results || tagsRes.data);
    }).catch(err => {
      console.error("Failed to fetch options", err);
      setError("加载表单选项失败，请刷新页面。");
      throw err;
    });

    let recipePromise = Promise.resolve();
    if (isEditing) {
      recipePromise = getRecipeDetail(id).then(res => {
        const recipe = res.data;
        setFormData({
          title: recipe.title || '',
          description: recipe.description || '',
          cooking_time_minutes: recipe.cooking_time_minutes || 30,
          difficulty: recipe.difficulty || 1,
          cuisine_type: recipe.cuisine_type || '',
          main_image: recipe.main_image || null,
          dietary_tags: recipe.dietary_tags.map(tag => tag.id),
          ingredients_data: recipe.recipe_ingredients.length > 0 ? recipe.recipe_ingredients.map(ing => ({
            ingredient_id: ing.ingredient_id,
            quantity: ing.quantity,
            unit: ing.unit,
            notes: ing.notes || '',
          })) : [{ ingredient_id: '', quantity: 1, unit: 'g', notes: '' }],
          steps_data: recipe.steps.length > 0 ? recipe.steps.map(step => ({
            step_number: step.step_number,
            description: step.description,
          })) : [{ step_number: 1, description: '' }],
        });
      }).catch(err => {
        console.error("Failed to fetch recipe data", err);
        setError("加载菜谱数据失败。");
        throw err;
      });
    }

    Promise.all([optionsPromise, recipePromise])
      .finally(() => {
        setLoading(false);
      });

  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({ ...formData, [name]: type === 'number' ? parseInt(value, 10) : value });
  };
  
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
        setImageFile(e.target.files[0]);
    }
  };

  const handleIngredientChange = (index, e) => {
    const newIngredients = [...formData.ingredients_data];
    const { name, value, type } = e.target;
    newIngredients[index][name] = type === 'number' ? parseFloat(value) : value;
    setFormData({ ...formData, ingredients_data: newIngredients });
  };
  
  const addIngredientField = () => {
    setFormData({ 
      ...formData, 
      ingredients_data: [...formData.ingredients_data, { ingredient_id: '', quantity: 1, unit: 'g', notes: '' }] 
    });
  };
  
  const removeIngredientField = (index) => {
    if (formData.ingredients_data.length > 1) {
      const newIngredients = formData.ingredients_data.filter((_, i) => i !== index);
      setFormData({ ...formData, ingredients_data: newIngredients });
    }
  };

  const handleStepChange = (index, e) => {
    const newSteps = [...formData.steps_data];
    const { name, value } = e.target;
    newSteps[index][name] = name === 'step_number' ? parseInt(value, 10) : value;
    setFormData({ ...formData, steps_data: newSteps });
  };

  const addStepField = () => {
      const nextStepNumber = formData.steps_data.length > 0
          ? Math.max(...formData.steps_data.map(s => s.step_number || 0)) + 1
          : 1;
      setFormData({
          ...formData,
          steps_data: [...formData.steps_data, { step_number: nextStepNumber, description: '' }]
      });
  };

  const removeStepField = (index) => {
      if (formData.steps_data.length > 1) {
          const newSteps = formData.steps_data.filter((_, i) => i !== index)
              .map((step, i) => ({ ...step, step_number: i + 1 }));
          setFormData({ ...formData, steps_data: newSteps });
      }
  };

  const handleTagChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value, 10));
    setFormData({ ...formData, dietary_tags: selectedOptions });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.title) {
        setError("菜谱标题不能为空。");
        setLoading(false);
        return;
    }
    if (formData.ingredients_data.some(ing => !ing.ingredient_id)) {
        setError("所有食材都必须选择。");
        setLoading(false);
        return;
    }

    const submissionData = new FormData();
    submissionData.append('title', formData.title);
    submissionData.append('description', formData.description);
    submissionData.append('cooking_time_minutes', formData.cooking_time_minutes);
    submissionData.append('difficulty', formData.difficulty);
    submissionData.append('cuisine_type', formData.cuisine_type);
    
    if (imageFile) {
        submissionData.append('main_image', imageFile);
    }
    
    formData.dietary_tags.forEach(tagId => {
        submissionData.append('dietary_tags', tagId);
    });
    
    submissionData.append('ingredients_data', JSON.stringify(formData.ingredients_data));
    submissionData.append('steps_data', JSON.stringify(formData.steps_data));
    
    try {
      if (isEditing) {
        await updateRecipe(id, submissionData);
        navigate(`/recipes/${id}`);
      } else {
        const response = await createRecipe(submissionData);
        navigate(`/recipes/${response.data.id}`);
      }
    } catch (err) {
      console.error(err.response?.data || err);
      setError('提交失败，请检查所有字段。');
      setLoading(false);
    }
  };

  if (loading) return <p>正在加载表单...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  
  return (
    <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px' }}>
      <h2>{isEditing ? '编辑菜谱' : '创建新菜谱'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>主图</label>
          <input type="file" name="main_image" onChange={handleImageChange} accept="image/*" />
          {isEditing && formData.main_image && !imageFile && (
            <div style={{ marginTop: '10px' }}>
              <p>当前图片:</p>
              <img src={formData.main_image} alt="Current main" style={{ width: '150px', borderRadius: '4px' }} />
            </div>
          )}
        </div>
        <div>
            <label>标题</label>
            <input name="title" value={formData.title} onChange={handleChange} placeholder="菜谱标题" required style={{width: '100%'}}/>
        </div>
        <div>
            <label>简介</label>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="菜谱简介" style={{width: '100%', minHeight: '80px'}}/>
        </div>
        <div style={{display: 'flex', gap: '10px'}}>
            <div style={{flex: 1}}>
                <label>烹饪时间(分钟)</label>
                <input type="number" name="cooking_time_minutes" value={formData.cooking_time_minutes} onChange={handleChange} style={{width: '100%'}}/>
            </div>
            <div style={{flex: 1}}>
                <label>难度</label>
                <select name="difficulty" value={formData.difficulty} onChange={handleChange} style={{width: '100%'}}>
                    <option value={1}>简单</option>
                    <option value={2}>中等</option>
                    <option value={3}>困难</option>
                </select>
            </div>
            <div style={{flex: 1}}>
                <label>菜系</label>
                <input name="cuisine_type" value={formData.cuisine_type} onChange={handleChange} placeholder="如：川菜" style={{width: '100%'}}/>
            </div>
        </div>
        <div>
          <label>饮食标签 (按住 Ctrl/Cmd 多选)</label>
          <select multiple value={formData.dietary_tags} onChange={handleTagChange} size="5" style={{width: '100%'}}>
            {allTags.map(tag => <option key={tag.id} value={tag.id}>{tag.name}</option>)}
          </select>
        </div>

        <div>
          <h4>食材列表</h4>
          {formData.ingredients_data.map((ing, index) => (
            <div key={index} style={{display: 'flex', gap: '5px', alignItems: 'center', marginBottom: '5px'}}>
              <select name="ingredient_id" value={ing.ingredient_id} onChange={(e) => handleIngredientChange(index, e)} required style={{flex: 3}}>
                <option value="">选择食材</option>
                {allIngredients.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
              <input type="number" step="0.1" name="quantity" value={ing.quantity} onChange={(e) => handleIngredientChange(index, e)} placeholder="用量" style={{flex: 1}}/>
              <select name="unit" value={ing.unit} onChange={(e) => handleIngredientChange(index, e)} style={{flex: 1.5}}>
                  {UNIT_CHOICES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
              <input name="notes" value={ing.notes} onChange={(e) => handleIngredientChange(index, e)} placeholder="备注 (如: 切碎)" style={{flex: 2}}/>
              <button type="button" onClick={() => removeIngredientField(index)} disabled={formData.ingredients_data.length <= 1}>×</button>
            </div>
          ))}
          <button type="button" onClick={addIngredientField}>+ 添加食材</button>
        </div>
        
        <div>
          <h4>制作步骤</h4>
          {formData.steps_data.map((step, index) => (
            <div key={index} style={{display: 'flex', gap: '5px', alignItems: 'center', marginBottom: '5px'}}>
              <span style={{marginRight: '10px'}}>第 {step.step_number} 步:</span>
              <input type="hidden" name="step_number" value={step.step_number} />
              <textarea name="description" value={step.description} onChange={(e) => handleStepChange(index, e)} required style={{flex: 1, minHeight: '50px'}} placeholder="步骤描述"/>
              <button type="button" onClick={() => removeStepField(index)} disabled={formData.steps_data.length <= 1}>×</button>
            </div>
          ))}
          <button type="button" onClick={addStepField}>+ 添加步骤</button>
        </div>
        
        {error && <p style={{color: 'red'}}>{error}</p>}
        <button type="submit" disabled={loading} style={{padding: '10px', fontSize: '16px'}}>
            {loading ? '提交中...' : (isEditing ? '更新菜谱' : '创建菜谱')}
        </button>
      </form>
    </div>
  );
}

export default RecipeFormPage;