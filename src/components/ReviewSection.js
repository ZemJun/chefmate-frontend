// src/components/ReviewSection.js (替换后的完整代码)

import React, { useState, useEffect, useCallback } from 'react';
import { getReviewsForRecipe, addReviewForRecipe, deleteReview } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext'; // 导入通知 hook

import {
    Box, Typography, Button, TextField, Rating,
    List, ListItem, ListItemText, ListItemAvatar, Avatar,
    Divider, Alert, CircularProgress, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function ReviewSection({ recipeId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { showNotification } = useNotification(); // 获取通知函数

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getReviewsForRecipe(recipeId);
      setReviews(response.data.results || response.data);
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    }
    setLoading(false);
  }, [recipeId]);

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
      showNotification('评价发表成功！', 'success');
      await fetchReviews();
    } catch (err) {
      setError(err.response?.data?.detail || '发表评价失败，您可能已经评价过。');
      console.error(err);
    }
    setSubmitLoading(false);
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('确定要删除这条评价吗？')) {
      try {
        await deleteReview(recipeId, reviewId);
        showNotification('评价已删除。', 'info');
        fetchReviews();
      } catch (err) {
        showNotification('删除失败！', 'error');
        console.error(err);
      }
    }
  };

  return (
    <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid #eee' }}>
      <Typography variant="h5" gutterBottom>用户评价</Typography>
      
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

      {loading ? <CircularProgress /> : (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <React.Fragment key={review.id}>
                <ListItem 
                  alignItems="flex-start"
                  secondaryAction={
                    user && user.username === review.user_username && (
                      <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteReview(review.id)}>
                        <DeleteIcon />
                      </IconButton>
                    )
                  }
                >
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