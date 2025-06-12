// src/hooks/useApi.js
import { useState, useCallback } from 'react';

export const useApi = (apiFunc) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFunc(...args);
      setData(response.data);
      return response.data; // 返回数据，方便在 then 中处理
    } catch (err) {
      setError(err.response?.data || { message: 'An unexpected error occurred.' });
      throw err; // 抛出错误，方便在 catch 中处理
    } finally {
      setLoading(false);
    }
  }, [apiFunc]);

  return { data, loading, error, request };
};