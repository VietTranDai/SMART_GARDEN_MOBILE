import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { gardenService } from "@/service/api";
import activityService from "@/service/api/activity.service";
import { JournalData, JournalStats } from '../types';
import { PaginationMeta } from '@/types/activities/dtos';

export const useJournalData = () => {
  const [data, setData] = useState<JournalData>({
    activities: [],
    gardens: [],
    loading: true,
    refreshing: false,
    error: null,
    loadingMore: false,
    gardenFetchError: null,
    loadingGardens: true,
  });

  const [stats, setStats] = useState<JournalStats>({
    total: 0,
    thisMonth: 0,
    thisWeek: 0,
  });

  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);

  // Use refs to prevent multiple simultaneous calls
  const activitiesRequestRef = useRef<AbortController | null>(null);
  const statsRequestRef = useRef<AbortController | null>(null);

  // Fetch gardens for filter
  const fetchUserGardens = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loadingGardens: true, gardenFetchError: null }));
      const userGardens = await gardenService.getGardens();
      setData(prev => ({ ...prev, gardens: userGardens || [] }));
    } catch (err) {
      console.error("Failed to fetch gardens for filter:", err);
      setData(prev => ({ ...prev, gardenFetchError: "Không thể tải danh sách vườn để lọc." }));
    } finally {
      setData(prev => ({ ...prev, loadingGardens: false }));
    }
  }, []);

  // Fetch activities
  const fetchActivities = useCallback(async (
    pageNum = 1, 
    refresh = false,
    filters: {
      selectedGardenId?: string;
      selectedActivityType?: string;
    } = {}
  ) => {
    try {
      // Cancel previous activities request if it exists
      if (activitiesRequestRef.current) {
        activitiesRequestRef.current.abort();
      }

      // Create new AbortController for this request
      activitiesRequestRef.current = new AbortController();

      setData(prev => ({ ...prev, error: null }));
      
      if (pageNum === 1 || refresh) {
        setData(prev => ({ ...prev, loading: true }));
      } else {
        setData(prev => ({ ...prev, loadingMore: true }));
      }

      const params: any = {
        page: pageNum,
        limit: 10,
      };
      
      if (filters.selectedGardenId) {
        params.gardenId = parseInt(filters.selectedGardenId);
      }
      
      if (filters.selectedActivityType) {
        // Use 'type' parameter as expected by the activities API
        params.type = filters.selectedActivityType;
      }

      const response = await activityService.getActivities(params);
      
      // Check if request was cancelled
      if (activitiesRequestRef.current?.signal.aborted) {
        return;
      }

      const items = response.items || [];
      const meta = response.meta || null;

      if (pageNum === 1 || refresh) {
        setData(prev => ({ ...prev, activities: items }));
      } else {
        setData(prev => ({ ...prev, activities: [...prev.activities, ...items] }));
      }
      
      setPagination(meta);
      setPage(pageNum);
      
    } catch (err: any) {
      // Don't show error if request was cancelled
      if (err.name === 'AbortError') {
        return;
      }
      
      console.error('Failed to load activities:', err);
      setData(prev => ({ ...prev, error: 'Không thể tải nhật ký hoạt động. Vui lòng thử lại sau.' }));
    } finally {
      // Only update loading state if request wasn't cancelled
      if (!activitiesRequestRef.current?.signal.aborted) {
        setData(prev => ({ ...prev, loading: false, loadingMore: false, refreshing: false }));
      }
      activitiesRequestRef.current = null;
    }
  }, []);

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async (filters: {
    selectedGardenId?: string;
    selectedActivityType?: string;
  } = {}) => {
    try {
      // Cancel previous stats request if it exists
      if (statsRequestRef.current) {
        statsRequestRef.current.abort();
      }

      // Create new AbortController for this request
      statsRequestRef.current = new AbortController();

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const currentDay = now.getDay();
      const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay; 
      const firstDayOfWeek = new Date(now);
      firstDayOfWeek.setDate(now.getDate() + diffToMonday);
      firstDayOfWeek.setHours(0,0,0,0);

      const lastDayOfWeek = new Date(firstDayOfWeek);
      lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
      lastDayOfWeek.setHours(23,59,59,999);

      const baseParams: any = {};
      if (filters.selectedGardenId) baseParams.gardenId = parseInt(filters.selectedGardenId);
      if (filters.selectedActivityType) baseParams.activityType = filters.selectedActivityType;

      const [monthStats, weekStats] = await Promise.all([
        activityService.getActivityStats({ 
          ...baseParams,
          startDate: firstDayOfMonth.toISOString(), 
          endDate: lastDayOfMonth.toISOString() 
        }),
        activityService.getActivityStats({ 
          ...baseParams,
          startDate: firstDayOfWeek.toISOString(), 
          endDate: lastDayOfWeek.toISOString() 
        })
      ]);

      // Check if request was cancelled
      if (statsRequestRef.current?.signal.aborted) {
        return;
      }

      setStats(prev => ({
        ...prev,
        thisMonth: monthStats?.overview?.totalActivities || 0,
        thisWeek: weekStats?.overview?.totalActivities || 0,
      }));

    } catch (err: any) {
      // Don't show error if request was cancelled
      if (err.name === 'AbortError') {
        return;
      }
      
      console.error("Failed to fetch detailed activity stats:", err);
      setStats(prev => ({ ...prev, thisMonth: 0, thisWeek: 0 }));
    } finally {
      statsRequestRef.current = null;
    }
  }, []);

  // Handle refresh
  const onRefresh = useCallback(async (filters: {
    selectedGardenId?: string;
    selectedActivityType?: string;
  } = {}) => {
    setData(prev => ({ ...prev, refreshing: true }));
    await fetchActivities(1, true, filters);
    setData(prev => ({ ...prev, refreshing: false }));
  }, [fetchActivities]);

  // Load more activities
  const loadMoreActivities = useCallback((filters: {
    selectedGardenId?: string;
    selectedActivityType?: string;
  } = {}) => {
    if (!pagination || data.loadingMore || !data.activities || data.activities.length === 0 || 
        (pagination && data.activities.length >= pagination.totalItems)) {
      return;
    }
    
    const nextPage = page + 1;
    if (nextPage <= pagination.totalPages) {
      fetchActivities(nextPage, false, filters);
    }
  }, [pagination, data.loadingMore, data.activities, page, fetchActivities]);

  // Update total stats when pagination changes
  const updateTotalStats = useCallback(() => {
    if (pagination) {
      setStats(prev => ({ ...prev, total: pagination.totalItems || 0 }));
    }
  }, [pagination]);

  return {
    data,
    stats,
    pagination,
    page,
    fetchUserGardens,
    fetchActivities,
    fetchDashboardStats,
    onRefresh,
    loadMoreActivities,
    updateTotalStats,
  };
}; 