// src/components/ReviewSection.js (修改后)
import React, { useState, useEffect, useCallback } from 'react'; // <-- 导入 useCallback
import { getReviewsForRecipe, addReviewForRecipe } from '../api/api';
import { useAuth } from '../context/AuthContext';

// 我们也顺便用 MUI 组件来美化这个区域
import {
    Box, Typography, Button, TextField, Rating, // <-- 使用 MUI 的 Rating 组件
    List, ListItem, ListItemText, ListItemAvatar, Avatar,
    Divider, Alert, CircularProgress
} from '@mui/material';

function ReviewSection({ recipeId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // 使用 useCallback 包装 fetchReviews
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getReviewsForRecipe(recipeId);
      setReviews(response.data.results || response.data);
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    }
    setLoading(false);
  }, [recipeId]); // <-- fetchReviews 依赖于 recipeId

  // 现在可以安全地将 fetchReviews 加入依赖数组
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setError('');
    if (!user) {
      setError('请先登录再发表评价。');
      return;
    }
    setSubmitLoading(true);
    try {
      await addReviewForRecipe(recipeId, { rating: newRating, comment: newComment });
      setNewComment('');
      setNewRating(5);
      await fetchReviews(); // 成功后重新加载评价
    } catch (err) {
      setError(err.response?.data?.detail || '发表评价失败，您可能已经评价过。');
      console.error(err);
    }
    setSubmitLoading(false);
  };

  return (
    <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid #eee' }}>
      <Typography variant="h5" gutterBottom>用户评价</Typography>
      
      {/* 评价表单 */}
      {user && (
        <Box component="form" onSubmit={handleSubmitReview} sx={{ mb: 4 }}>
          <Typography variant="h6">发表你的评价</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography component="legend">评分:</Typography>
            <Rating
              name="simple-controlled"
              value={newRating}
              onChange={(event, newValue) => {
                setNewRating(newValue);
              }}
            />
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="写下你的评论..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={submitLoading}>
            {submitLoading ? <CircularProgress size={24} /> : '提交评价'}
          </Button>
        </Box>
      )}

      {/* 评价列表 */}
      {loading ? <CircularProgress /> : (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <React.Fragment key={review.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>{review.user_username.charAt(0).toUpperCase()}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography sx={{ mr: 1, fontWeight: 'bold' }}>{review.user_username}</Typography>
                        <Rating value={review.rating} readOnly />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {review.comment}
                        </Typography>
                        <Typography component="p" variant="caption" color="text.secondary" sx={{mt:1}}>
                           {new Date(review.created_at).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < reviews.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))
          ) : (
            <Typography color="text.secondary">暂无评价，快来抢沙发吧！</Typography>
          )}
        </List>
      )}
    </Box>
  );
}

export default ReviewSection;