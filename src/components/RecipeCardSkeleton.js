// src/components/RecipeCardSkeleton.js (已修正警告)
import React from 'react';
import { Card, Skeleton, CardContent } from '@mui/material';


function RecipeCardSkeleton() {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}> 
      <Skeleton variant="rectangular" height={194} width="100%" />
      <CardContent sx={{flexGrow: 1}}> 
        <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 1 }} width="90%"/>
        <Skeleton variant="text" sx={{ fontSize: '0.875rem', mb: 0.5 }} width="60%" />
        <Skeleton variant="text" sx={{ fontSize: '0.875rem', mb: 2}} width="70%" />
        <Skeleton variant="rectangular" width="50%" height={24}/>
      </CardContent>
    </Card>
  );
}

export default RecipeCardSkeleton;