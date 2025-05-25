import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/contexts/UserContext";
import { useGardenContext } from "@/contexts/GardenContext";
import { SensorType } from "@/types/gardens/sensor.types";

// Import custom hooks
import { useGardenDetail } from "./garden/useGardenDetail";
import useSensorData, { getSensorStatus } from "./sensor/useSensorData";
import useWeatherData from "./weather/useWeatherData";
import useAlertData from "./alert/useAlertData";
import useActivityData from "./activity/useActivityData";
import gardenService from "@/service/api/garden.service";
import useGardenManagement from "./garden/useGardenManagement";

/**
 * Main hook for Home screen data management
 *
 * This is the central hook that integrates data from various specialized hooks.
 */
export default function useHomeData() {
  // Context hooks
  const { user } = useUser();
  const { selectedGardenId, setSelectedGardenId } = useGardenContext();

  // Specialized data hooks
  const gardenManagement = useGardenManagement();
  const { markGardenVisited, updateGardenAlertCount, updateGardenSensorData } =
    gardenManagement;
  const gardenDetail = useGardenDetail({
    gardenId: selectedGardenId ? String(selectedGardenId) : null,
  });
  const sensorData = useSensorData();
  const weatherData = useWeatherData();
  const alertDataHook = useAlertData();
  const activityData = useActivityData();

  // UI state
  const [refreshing, setRefreshing] = useState(false);

  // Destructure functions from sensorData for stable dependencies
  const {
    startWatchingGarden,
    fetchSensorData: fetchSensorDataFromHook,
    getLatestReadings: getLatestReadingsFromHook,
  } = sensorData;

  // Destructure functions from other data hooks for stable dependencies
  const { fetchCompleteWeatherData, fetchWeatherAdvice } = weatherData;
  const {
    fetchGardenAlerts,
    fetchAllGardenAlerts,
    getActiveAlertCount,
    alertsLoading,
    alertsError,
    gardenAlerts: gardenAlertsFromAlertHook,
    resolveAlert,
    ignoreAlert,
  } = alertDataHook;
  const { loadActivitiesAndSchedules } = activityData;

  /**
   * Load detailed data for a specific garden
   */
  const loadGardenDetailData = useCallback(
    async (gardenId: number) => {
      if (!gardenId) return;

      try {
        // Fetch sensor data
        await fetchSensorDataFromHook(gardenId);
        await fetchCompleteWeatherData(gardenId);
        await fetchWeatherAdvice(gardenId);
        await fetchGardenAlerts(gardenId);
        await loadActivitiesAndSchedules(gardenId);

        // Update garden alert count
        const alertCount = getActiveAlertCount(gardenId);
        updateGardenAlertCount(gardenId, alertCount);

        // Update garden sensor data
        const latestReadings = getLatestReadingsFromHook(gardenId);
        const displaySensorData = {
          temperature: latestReadings[SensorType.TEMPERATURE]?.value,
          humidity: latestReadings[SensorType.HUMIDITY]?.value,
          soilMoisture: latestReadings[SensorType.SOIL_MOISTURE]?.value,
          light: latestReadings[SensorType.LIGHT]?.value,
        };
        updateGardenSensorData(gardenId, displaySensorData);
      } catch (error) {
        console.error(
          `Error loading detail data for garden ${gardenId}:`,
          error
        );
      }
    },
    [
      fetchSensorDataFromHook,
      fetchCompleteWeatherData,
      fetchWeatherAdvice,
      fetchGardenAlerts,
      loadActivitiesAndSchedules,
      updateGardenAlertCount,
      updateGardenSensorData,
      getLatestReadingsFromHook,
      getActiveAlertCount,
    ]
  );

  /**
   * Initialize data on first load
   */
  useEffect(() => {
    loadInitialData();

    // Cleanup when component unmounts
    return () => {
      sensorData.stopPolling();
    };
  }, []);

  /**
   * Watch for changes in selected garden to load its details and start watching sensors
   */
  useEffect(() => {
    if (selectedGardenId !== null) {
      startWatchingGarden(selectedGardenId);
      loadGardenDetailData(selectedGardenId);
    }
  }, [selectedGardenId, startWatchingGarden, loadGardenDetailData]);

  /**
   * Watch for changes in selected garden to mark it as visited
   */
  useEffect(() => {
    if (selectedGardenId !== null) {
      markGardenVisited(selectedGardenId);
    }
  }, [selectedGardenId, markGardenVisited]);

  /**
   * Load all initial data for the home screen
   */
  const loadInitialData = useCallback(async () => {
    try {
      // Fetch gardens first
      const gardens = await gardenManagement.fetchGardens();

      if (gardens.length > 0) {
        // Fetch alerts for all gardens
        const gardenIds = gardens.map((garden) => garden.id);
        await fetchAllGardenAlerts(gardenIds);

        // Update alert counts for each garden
        gardens.forEach((garden) => {
          const alertCount = getActiveAlertCount(garden.id);
          updateGardenAlertCount(garden.id, alertCount);
        });

        // Select first garden if none selected
        if (selectedGardenId === null && gardens.length > 0) {
          setSelectedGardenId(gardens[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  }, [
    gardenManagement.fetchGardens,
    selectedGardenId,
    setSelectedGardenId,
    updateGardenAlertCount,
    fetchAllGardenAlerts,
    getActiveAlertCount,
  ]);

  /**
   * Handle pull-to-refresh action
   */
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      // Reload everything
      await loadInitialData();

      // Reload detail data for selected garden
      if (selectedGardenId !== null) {
        await loadGardenDetailData(selectedGardenId);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [loadInitialData, loadGardenDetailData, selectedGardenId]);

  /**
   * Select a garden
   */
  const selectGarden = useCallback(
    (gardenId: number) => {
      setSelectedGardenId(gardenId);
    },
    [setSelectedGardenId]
  );

  /**
   * Fetch garden advice for a specific garden
   */
  const fetchGardenAdvice = useCallback(async (gardenId: number) => {
    try {
      return await gardenService.getGardenAdvice(gardenId);
    } catch (error) {
      console.error(
        `Error fetching garden advice for garden ${gardenId}:`,
        error
      );
      return [];
    }
  }, []);

  return {
    // User and context data
    user,
    selectedGardenId,

    // Status and UI state
    refreshing,
    loading: gardenManagement.isLoading,
    error: gardenManagement.error,

    // Gardens
    gardens: gardenManagement.gardens,

    // Selected Garden Detail
    selectedGardenDetail: gardenDetail.garden,
    selectedGardenPlantDetails: gardenDetail.plantDetails,
    selectedGardenLoading: gardenDetail.isLoading,
    selectedGardenError: gardenDetail.error,
    selectedGardenPhotos: gardenDetail.photos,
    selectedGardenAlerts: gardenDetail.alerts,
    selectedGardenActivities: gardenDetail.activities,
    selectedGardenWateringSchedule: gardenDetail.wateringSchedule,
    selectedGardenCurrentWeather: gardenDetail.currentWeather,
    selectedGardenHourlyForecast: gardenDetail.hourlyForecast,
    selectedGardenDailyForecast: gardenDetail.dailyForecast,

    // Sensors
    gardenSensorData: sensorData.gardenSensorData,
    sensorDataLoading: sensorData.sensorDataLoading,
    sensorDataError: sensorData.sensorDataError,
    getSensorIconName: sensorData.getSensorIconName,
    getSensorStatus,

    // Weather
    weatherData: weatherData.weatherData,
    gardenWeatherData: weatherData.gardenWeatherData,
    weatherAdviceByGarden: weatherData.weatherAdviceByGarden,
    optimalGardenTimes: weatherData.optimalGardenTimes,
    weatherDetailLoading: weatherData.weatherDetailLoading,
    weatherDetailError: weatherData.weatherDetailError,
    getWeatherTip: weatherData.getWeatherTip,

    // Alerts
    alertsLoading,
    alertsError,

    // Activities
    recentActivities: activityData.recentActivities,
    upcomingSchedules: activityData.upcomingSchedules,
    activitiesLoading: activityData.activitiesLoading,
    schedulesLoading: activityData.schedulesLoading,

    // Alerts from alertData hook
    gardenAlerts: gardenAlertsFromAlertHook,

    // Functions
    selectGarden,
    handleRefresh,
    fetchCompleteWeatherData,
    fetchWeatherAdvice,
    fetchGardenAdvice,
    calculateOptimalTimes: weatherData.calculateOptimalTimes,
    resolveAlert,
    ignoreAlert,
    completeActivity: activityData.completeActivity,
    completeWateringSchedule: activityData.completeWateringSchedule,
    skipScheduledActivity: activityData.skipScheduledActivity,
  };
}
