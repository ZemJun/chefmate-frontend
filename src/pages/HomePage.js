import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function HomePage() {
  const { user } = useAuth();
  return (
    <div>
      <h1>欢迎来到 ChefMate AI</h1>
      {user ? (
        <div>
          <p>你已登录！开始探索菜谱吧！</p>
          <Link to="/recipes">
            <button>浏览所有菜谱</button>
          </Link>
        </div>
      ) : (
        <div>
          <p>请登录以享受个性化服务。</p>
          <Link to="/login">
            <button>去登录</button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default HomePage;