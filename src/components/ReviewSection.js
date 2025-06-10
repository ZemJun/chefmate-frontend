// src/components/ReviewSection.js
import React, { useState, useEffect } from 'react';
import { getReviewsForRecipe, addReviewForRecipe } from '../api/api';
import { useAuth } from '../context/AuthContext';

function ReviewSection({ recipeId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await getReviewsForRecipe(recipeId);
      setReviews(response.data.results || response.data);
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [recipeId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setError('');
    if (!user) {
      setError('请先登录再发表评价。');
      return;
    }
    try {
      await addReviewForRecipe(recipeId, { rating: newRating, comment: newComment });
      // 成功后清空表单并重新加载评价列表
      setNewComment('');
      setNewRating(5);
      fetchReviews();
    } catch (err) {
      setError(err.response?.data?.detail || '发表评价失败，您可能已经评价过。');
      console.error(err);
    }
  };

  return (
    <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
      <h3>用户评价</h3>
      
      {/* 评价表单 */}
      {user && (
        <form onSubmit={handleSubmitReview}>
          <h4>发表你的评价</h4>
          <div>
            <label>评分: </label>
            <select value={newRating} onChange={(e) => setNewRating(Number(e.target.value))}>
              <option value={5}>5星 - 非常棒</option>
              <option value={4}>4星 - 很好</option>
              <option value={3}>3星 - 不错</option>
              <option value={2}>2星 - 一般</option>
              <option value={1}>1星 - 不推荐</option>
            </select>
          </div>
          <div>
            <textarea
              rows="4"
              cols="50"
              placeholder="写下你的评论..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            ></textarea>
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit">提交评价</button>
        </form>
      )}

      {/* 评价列表 */}
      {loading ? <p>正在加载评价...</p> : (
        reviews.length > 0 ? (
          reviews.map(review => (
            <div key={review.id} style={{ border: '1px solid #f0f0f0', padding: '10px', margin: '10px 0' }}>
              <p><strong>{review.user_username}</strong> - 评分: {'⭐'.repeat(review.rating)}</p>
              <p>{review.comment}</p>
              <small>发表于: {new Date(review.created_at).toLocaleString()}</small>
            </div>
          ))
        ) : (
          <p>暂无评价，快来抢沙发吧！</p>
        )
      )}
    </div>
  );
}

export default ReviewSection;