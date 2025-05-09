import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/contexts/UserContext";
import { useGardenContext } from "@/context/GardenContext";
import { SensorType } from "@/types/gardens/sensor.types";

// Import custom hooks
import useGardenData from "./useGardenData";
import useSensorData, { getSensorStatus } from "./useSensorData";
import useWeatherData from "./useWeatherData";
import useAlertData from "./useAlertData";
import useActivityData from "./useActivityData";

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
  const gardenData = useGardenData();
  const sensorData = useSensorData();
  const weatherData = useWeatherData();
  const alertData = useAlertData();
  const activityData = useActivityData();

  // UI state
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Initialize data on first load
   */
  useEffect(() => {
    loadInitialData();

    // Cleanup when component unmounts
    return () => {
      // Stop polling
      sensorData.stopPolling();
    };
  }, []);

  /**
   * Watch for changes in selected garden
   */
  useEffect(() => {
    if (selectedGardenId !== null) {
      // Start watching the selected garden
      sensorData.startWatchingGarden(selectedGardenId);

      // Load data for the selected garden
      loadGardenDetailData(selectedGardenId);

      // Mark garden as visited
      gardenData.markGardenVisited(selectedGardenId);
    }
  }, [selectedGardenId]);

  /**
   * Load all initial data for the home screen
   */
  const loadInitialData = useCallback(async () => {
    try {
      // Fetch gardens first
      const gardens = await gardenData.fetchGardens();

      if (gardens.length > 0) {
        // Fetch alerts for all gardens
        const gardenIds = gardens.map((garden) => garden.id);
        await alertData.fetchAllGardenAlerts(gardenIds);

        // Update alert counts for each garden
        gardens.forEach((garden) => {
          const alertCount = alertData.getActiveAlertCount(garden.id);
          gardenData.updateGardenAlertCount(garden.id, alertCount);
        });

        // Select first garden if none selected
        if (selectedGardenId === null && gardens.length > 0) {
          setSelectedGardenId(gardens[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  }, [gardenData, alertData, selectedGardenId, setSelectedGardenId]);

  /**
   * Load detailed data for a specific garden
   */
  const loadGardenDetailData = useCallback(
    async (gardenId: number) => {
      if (!gardenId) return;

      try {
        // Fetch sensor data
        await sensorData.fetchSensorData(gardenId);

        const weatherResult = await weatherData.fetchCompleteWeatherData(
          gardenId
        );

        // // Debug if weather data was fetched correctly
        // console.log(`useHomeData: Weather data fetched result:`, {
        //   success: !!weatherResult,
        //   hasGardenWeatherData:
        //     weatherData.gardenWeatherData &&
        //     gardenId in weatherData.gardenWeatherData,
        //   dataType: weatherResult ? typeof weatherResult : "undefined",
        //   hasHourly: weatherResult && "hourly" in weatherResult,
        //   hourlyType: weatherResult?.hourly
        //     ? typeof weatherResult.hourly
        //     : "undefined",
        //   isHourlyArray: weatherResult?.hourly
        //     ? Array.isArray(weatherResult.hourly)
        //     : false,
        // });

        // Fetch weather advice
        await weatherData.fetchWeatherAdvice(gardenId);

        // Fetch alerts
        await alertData.fetchGardenAlerts(gardenId);

        // Fetch activities and schedules
        await activityData.loadActivitiesAndSchedules(gardenId);

        // Update garden alert count
        const alertCount = alertData.getActiveAlertCount(gardenId);
        gardenData.updateGardenAlertCount(gardenId, alertCount);

        // Update garden sensor data
        const latestReadings = sensorData.getLatestReadings(gardenId);
        const displaySensorData = {
          temperature: latestReadings[SensorType.TEMPERATURE]?.value,
          humidity: latestReadings[SensorType.HUMIDITY]?.value,
          soilMoisture: latestReadings[SensorType.SOIL_MOISTURE]?.value,
          light: latestReadings[SensorType.LIGHT]?.value,
        };
        gardenData.updateGardenSensorData(gardenId, displaySensorData);
      } catch (error) {
        console.error(
          `Error loading detail data for garden ${gardenId}:`,
          error
        );
      }
    },
    [sensorData, weatherData, alertData, activityData, gardenData]
  );

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

  return {
    // User and context data
    user,
    selectedGardenId,

    // Status and UI state
    refreshing,
    loading: gardenData.loading,
    error: gardenData.error,

    // Gardens
    gardens: gardenData.gardens,
    togglePinGarden: gardenData.togglePinGarden,

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
    gardenAlerts: alertData.gardenAlerts,
    alertsLoading: alertData.alertsLoading,
    alertsError: alertData.alertsError,

    // Activities
    recentActivities: activityData.recentActivities,
    upcomingSchedules: activityData.upcomingSchedules,
    activitiesLoading: activityData.activitiesLoading,
    schedulesLoading: activityData.schedulesLoading,

    // Functions
    selectGarden,
    handleRefresh,
    fetchCompleteWeatherData: weatherData.fetchCompleteWeatherData,
    fetchWeatherAdvice: weatherData.fetchWeatherAdvice,
    calculateOptimalTimes: weatherData.calculateOptimalTimes,
    resolveAlert: alertData.resolveAlert,
    ignoreAlert: alertData.ignoreAlert,
    completeActivity: activityData.completeActivity,
    completeWateringSchedule: activityData.completeWateringSchedule,
    skipScheduledActivity: activityData.skipScheduledActivity,
  };
}
