import { useState } from 'react';
import { analyzeSolar, getHistory, getAnalysisById, deleteAnalysis } from '../api/solar.api';

export const useSolarAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const analyze = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeSolar(data);
      if (res.data.success) {
        setResult(res.data.data.result);
        return res.data.data;
      } else {
        setError('Analysis failed');
        console.error('analyze response error:', res.data);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Analysis failed';
      setError(errorMsg);
      console.error('analyze error:', err);
      // Don't rethrow
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getHistory();
      if (res.data.success) {
        setHistory(res.data.data);
        return res.data.data;
      } else {
        setError('Failed to fetch history');
        console.error('fetchHistory response error:', res.data);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch history';
      setError(errorMsg);
      console.error('fetchHistory error:', err);
      // Don't rethrow - let component handle it
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysisById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAnalysisById(id);
      if (res.data.success) {
        return res.data.data;
      } else {
        setError('Failed to fetch analysis');
        console.error('fetchAnalysisById response error:', res.data);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch analysis';
      setError(errorMsg);
      console.error('fetchAnalysisById error:', err);
      // Don't rethrow
    } finally {
      setLoading(false);
    }
  };

  const removeAnalysis = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteAnalysis(id);
      setHistory(history.filter(item => item._id !== id));
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete analysis';
      setError(errorMsg);
      console.error('removeAnalysis error:', err);
      // Don't rethrow
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);
  const clearResult = () => setResult(null);

  return {
    loading,
    error,
    result,
    history,
    analyze,
    fetchHistory,
    fetchAnalysisById,
    removeAnalysis,
    clearError,
    clearResult,
  };
};
