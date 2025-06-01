import { useState, useCallback } from 'react';
import activityService from "@/service/api/activity.service";
import { GardenActivityAnalyticsDto } from '@/types/activities/dtos';

export const useActivityAnalytics = () => {
  const [analytics, setAnalytics] = useState<GardenActivityAnalyticsDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivityAnalytics = useCallback(async (activityId: number) => {
    console.log('🔍 Fetching analytics for activity ID:', activityId);
    setLoading(true);
    setError(null);
    
    try {
      const result = await activityService.getActivityAnalysis(activityId);
      console.log('✅ Analytics result:', result);
      setAnalytics(result);
    } catch (err) {
      console.error('❌ Error in fetchActivityAnalytics:', err);
      
      let errorMessage = 'Lỗi khi tải phân tích hoạt động';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = (err as any).message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearAnalytics = useCallback(() => {
    setAnalytics(null);
    setError(null);
  }, []);

  return {
    analytics,
    loading,
    error,
    fetchActivityAnalytics,
    clearAnalytics,
  };
}; 