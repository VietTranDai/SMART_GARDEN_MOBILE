import { useState, useCallback, useRef } from 'react';
import activityService from "@/service/api/activity.service";
import { ActivityStatsResponseDto } from '@/types/activities/dtos';
import { JournalDetailedStats } from '../types';

export const useJournalStats = () => {
  const [detailedStats, setDetailedStats] = useState<JournalDetailedStats>({
    detailedStats: null,
    statsLoading: false,
    statsError: null,
  });

  // Use ref to prevent multiple simultaneous calls
  const currentRequestRef = useRef<AbortController | null>(null);

  // Fetch detailed activity statistics
  const fetchDetailedStats = useCallback(async (
    selectedDateRange: '7days' | '30days' | '90days',
    filters: {
      selectedGardenId?: string;
      selectedActivityType?: string;
    } = {}
  ) => {
    try {
      // Cancel previous request if it exists
      if (currentRequestRef.current) {
        currentRequestRef.current.abort();
      }

      // Create new AbortController for this request
      currentRequestRef.current = new AbortController();

      setDetailedStats(prev => ({ ...prev, statsLoading: true, statsError: null }));
      
      const now = new Date();
      const daysAgo = new Date(now);
      
      // Set date range based on selection
      switch (selectedDateRange) {
        case '7days':
          daysAgo.setDate(now.getDate() - 7);
          break;
        case '90days':
          daysAgo.setDate(now.getDate() - 90);
          break;
        default: // '30days'
          daysAgo.setDate(now.getDate() - 30);
          break;
      }
      
      const params: any = {
        startDate: daysAgo.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0],
      };
      
      if (filters.selectedGardenId) {
        params.gardenId = parseInt(filters.selectedGardenId);
      }
      
      if (filters.selectedActivityType) {
        // Fix the parameter name to match what the API expects
        params.activityType = filters.selectedActivityType;
      }
      
      const stats = await activityService.getActivityStats(params);
      
      // Check if request was cancelled
      if (currentRequestRef.current?.signal.aborted) {
        return;
      }
      
      setDetailedStats(prev => ({ ...prev, detailedStats: stats }));
      
    } catch (err: any) {
      // Don't show error if request was cancelled
      if (err.name === 'AbortError') {
        return;
      }
      
      console.error("Failed to fetch detailed stats:", err);
      setDetailedStats(prev => ({ ...prev, statsError: "Không thể tải thống kê chi tiết." }));
    } finally {
      // Only update loading state if request wasn't cancelled
      if (!currentRequestRef.current?.signal.aborted) {
        setDetailedStats(prev => ({ ...prev, statsLoading: false }));
      }
      currentRequestRef.current = null;
    }
  }, []);

  return {
    ...detailedStats,
    fetchDetailedStats,
  };
}; 