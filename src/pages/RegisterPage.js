// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/api';

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    nickname: '',
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (formData.password !== formData.password2) {
      setErrors({ password2: '两次输入的密码不一致。' });
      return;
    }
    try {
      await registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password2: formData.password2,
        nickname: formData.nickname,
      });
      // 注册成功后，提示用户并跳转到登录页面
      alert('注册成功！请登录。');
      navigate('/login');
    } catch (err) {
      if (err.response && err.response.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ general: '注册失败，请稍后再试。' });
      }
      console.error(err);
    }
  };

  return (
    <div>
      <h2>注册新账户</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>用户名:</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} required />
          {errors.username && <p style={{ color: 'red' }}>{errors.username}</p>}
        </div>
        <div>
          <label>邮箱:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
        </div>
        <div>
          <label>昵称 (可选):</label>
          <input type="text" name="nickname" value={formData.nickname} onChange={handleChange} />
        </div>
        <div>
          <label>密码:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          {errors.password && <p style={{ color: 'red' }}>{errors.password.join(' ')}</p>}
        </div>
        <div>
          <label>确认密码:</label>
          <input type="password" name="password2" value={formData.password2} onChange={handleChange} required />
          {errors.password2 && <p style={{ color: 'red' }}>{errors.password2}</p>}
        </div>
        {errors.general && <p style={{ color: 'red' }}>{errors.general}</p>}
        <button type="submit">注册</button>
      </form>
      <p>
        已有账户? <Link to="/login">返回登录</Link>
      </p>
    </div>
  );
}

export default RegisterPage;