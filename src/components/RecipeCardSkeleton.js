// src/components/RecipeCardSkeleton.js (新文件)

import React from 'react';
import { Card, Skeleton, Box } from '@mui/material';

function RecipeCardSkeleton() {
  return (
    <Card sx={{ width: 345, m: 2 }}>
      <Skeleton variant="rectangular" width={345} height={194} />
      <Box sx={{ p: 2 }}>
        <Skeleton variant="text" sx={{ fontSize: '1.25rem' }} />
        <Skeleton variant="text" sx={{ fontSize: '0.875rem', width: '60%' }} />
        <Skeleton variant="text" sx={{ mt: 1, width: '80%' }} />
      </Box>
    </Card>
  );
}

export default RecipeCardSkeleton;