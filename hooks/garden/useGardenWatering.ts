import { useState, useEffect, useCallback } from "react";
import { 
  wateringScheduleService, 
  wateringDecisionService 
} from "@/service/api/watering.service";
import { CreateWateringSchedule, WateringDecisionRequestDto } from "@/types/activities/watering-schedules.type";
import { WateringDecision, WateringStats } from "@/types/activities/watering-schedules.type";
import { WateringSchedule } from "@/types/activities/watering-schedules.type";

interface UseGardenWateringProps {
  gardenId: string | null;
}

interface UseGardenWateringReturn {
  // Watering Schedules
  schedules: WateringSchedule[];
  upcomingSchedules: any[];
  schedulesLoading: boolean;
  schedulesRefreshing: boolean;
  
  // AI Decision
  currentDecision: WateringDecision | null;
  decisionLoading: boolean;
  decisionStats: WateringStats | null;
  statsLoading: boolean;
  
  // AI Connection
  aiConnectionStatus: 'connected' | 'disconnected' | 'testing';
  
  // Actions
  refreshData: () => Promise<void>;
  createSchedule: (data: CreateWateringSchedule) => Promise<boolean>;
  autoGenerateSchedule: () => Promise<boolean>;
  completeSchedule: (scheduleId: number) => Promise<boolean>;
  skipSchedule: (scheduleId: number) => Promise<boolean>;
  deleteSchedule: (scheduleId: number) => Promise<boolean>;
  getAIDecision: (requestData?: WateringDecisionRequestDto) => Promise<void>;
  getAIDecisionWithData: (requestData: WateringDecisionRequestDto) => Promise<void>;
  getOptimalWaterAmount: (wateringTime: Date | string, notes?: string) => Promise<number | null>;
  testAIConnection: () => Promise<void>;
  
  // UI State
  isCreatingSchedule: boolean;
  isAutoGenerating: boolean;
  actionLoading: { [key: string]: boolean };
}

export const useGardenWatering = ({ 
  gardenId 
}: UseGardenWateringProps): UseGardenWateringReturn => {
  // Watering Schedules State
  const [schedules, setSchedules] = useState<WateringSchedule[]>([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState<any[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [schedulesRefreshing, setSchedulesRefreshing] = useState(false);
  
  // AI Decision State
  const [currentDecision, setCurrentDecision] = useState<WateringDecision | null>(null);
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [decisionStats, setDecisionStats] = useState<WateringStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  
  // AI Connection State
  const [aiConnectionStatus, setAiConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('disconnected');
  
  // Action State
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});

  // Set action loading
  const setActionLoadingState = useCallback((action: string, loading: boolean) => {
    setActionLoading(prev => ({ ...prev, [action]: loading }));
  }, []);

  // Load watering schedules
  const loadWateringSchedules = useCallback(async () => {
    if (!gardenId) return;
    
    setSchedulesLoading(true);
    try {
      const [schedulesData, upcomingData] = await Promise.all([
        wateringScheduleService.getByGarden(gardenId),
        wateringScheduleService.getUpcomingSchedules(gardenId, 10)
      ]);
      
      setSchedules(schedulesData);
      setUpcomingSchedules(upcomingData);
    } catch (error) {
      console.error("Error loading watering schedules:", error);
    } finally {
      setSchedulesLoading(false);
    }
  }, [gardenId]);

  // Load AI decision
  const getAIDecision = useCallback(async (requestData?: WateringDecisionRequestDto) => {
    if (!gardenId) return;
    
    setDecisionLoading(true);
    try {
      const decision = await wateringDecisionService.getDecisionByGarden(gardenId, requestData);
      setCurrentDecision(decision);
    } catch (error) {
      console.error("Error getting AI decision:", error);
    } finally {
      setDecisionLoading(false);
    }
  }, [gardenId]);

  // Get AI decision with specific request data
  const getAIDecisionWithData = useCallback(async (requestData: WateringDecisionRequestDto): Promise<void> => {
    await getAIDecision(requestData);
  }, [getAIDecision]);

  // Get optimal water amount for specific time
  const getOptimalWaterAmount = useCallback(async (
    wateringTime: Date | string, 
    notes?: string
  ): Promise<number | null> => {
    if (!gardenId) return null;
    
    try {
      return await wateringDecisionService.getOptimalWaterAmount(gardenId, wateringTime, notes);
    } catch (error) {
      console.error("Error getting optimal water amount:", error);
      return null;
    }
  }, [gardenId]);

  // Load AI stats
  const loadAIStats = useCallback(async () => {
    if (!gardenId) return;
    
    setStatsLoading(true);
    try {
      const stats = await wateringDecisionService.getStatsByGarden(gardenId, { days: 30 });
      setDecisionStats(stats);
    } catch (error) {
      console.error("Error loading AI stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, [gardenId]);

  // Test AI connection
  const testAIConnection = useCallback(async () => {
    setAiConnectionStatus('testing');
    try {
      const result = await wateringDecisionService.testAIConnection();
      setAiConnectionStatus(result ? 'connected' : 'disconnected');
    } catch (error) {
      console.error("Error testing AI connection:", error);
      setAiConnectionStatus('disconnected');
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    setSchedulesRefreshing(true);
    await Promise.all([
      loadWateringSchedules(),
      getAIDecision(),
      loadAIStats()
    ]);
    setSchedulesRefreshing(false);
  }, [loadWateringSchedules, getAIDecision, loadAIStats]);

  // Create watering schedule
  const createSchedule = useCallback(async (data: CreateWateringSchedule): Promise<boolean> => {
    if (!gardenId) return false;
    
    setIsCreatingSchedule(true);
    try {
      if(data.notes === undefined) {
        data.notes = "";
      }
      const result = await wateringScheduleService.create(gardenId, data);
      if (result) {
        await loadWateringSchedules();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error creating schedule:", error);
      return false;
    } finally {
      setIsCreatingSchedule(false);
    }
  }, [gardenId, loadWateringSchedules]);

  // Auto generate schedule
  const autoGenerateSchedule = useCallback(async (): Promise<boolean> => {
    if (!gardenId) return false;
    
    setIsAutoGenerating(true);
    try {
      const result = await wateringScheduleService.autoGenerate(gardenId);
      if (result) {
        await loadWateringSchedules();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error auto generating schedule:", error);
      return false;
    } finally {
      setIsAutoGenerating(false);
    }
  }, [gardenId, loadWateringSchedules]);

  // Complete schedule
  const completeSchedule = useCallback(async (scheduleId: number): Promise<boolean> => {
    setActionLoadingState(`complete-${scheduleId}`, true);
    try {
      const result = await wateringScheduleService.complete(scheduleId);
      if (result) {
        await loadWateringSchedules();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error completing schedule:", error);
      return false;
    } finally {
      setActionLoadingState(`complete-${scheduleId}`, false);
    }
  }, [loadWateringSchedules, setActionLoadingState]);

  // Skip schedule
  const skipSchedule = useCallback(async (scheduleId: number): Promise<boolean> => {
    setActionLoadingState(`skip-${scheduleId}`, true);
    try {
      const result = await wateringScheduleService.skip(scheduleId);
      if (result) {
        await loadWateringSchedules();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error skipping schedule:", error);
      return false;
    } finally {
      setActionLoadingState(`skip-${scheduleId}`, false);
    }
  }, [loadWateringSchedules, setActionLoadingState]);

  // Delete schedule
  const deleteSchedule = useCallback(async (scheduleId: number): Promise<boolean> => {
    setActionLoadingState(`delete-${scheduleId}`, true);
    try {
      const result = await wateringScheduleService.delete(scheduleId);
      if (result) {
        await loadWateringSchedules();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting schedule:", error);
      return false;
    } finally {
      setActionLoadingState(`delete-${scheduleId}`, false);
    }
  }, [loadWateringSchedules, setActionLoadingState]);

  // Initialize data on mount and gardenId change
  useEffect(() => {
    if (gardenId) {
      refreshData();
      testAIConnection();
    }
  }, [gardenId, refreshData, testAIConnection]);

  return {
    // Watering Schedules
    schedules,
    upcomingSchedules,
    schedulesLoading,
    schedulesRefreshing,
    
    // AI Decision
    currentDecision,
    decisionLoading,
    decisionStats,
    statsLoading,
    
    // AI Connection
    aiConnectionStatus,
    
    // Actions
    refreshData,
    createSchedule,
    autoGenerateSchedule,
    completeSchedule,
    skipSchedule,
    deleteSchedule,
    getAIDecision,
    getAIDecisionWithData,
    getOptimalWaterAmount,
    testAIConnection,
    
    // UI State
    isCreatingSchedule,
    isAutoGenerating,
    actionLoading,
  };
}; 