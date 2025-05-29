import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@/contexts/UserContext";
import { useGardenContext } from "@/contexts/GardenContext";
import { SensorType } from "@/types/gardens/sensor.types";

// Import custom hooks
import { useGardenDetail } from "./garden/useGardenDetail";
import useSensorData, { getSensorStatus } from "./sensor/useSensorData";
import useWeatherData from "./weather/useWeatherData";
import useAlertData from "./alert/useAlertData";
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
  const gardenDetailHook = useGardenDetail({
    gardenId: selectedGardenId ? String(selectedGardenId) : null,
  });
  const sensorDataHook = useSensorData();
  const weatherDataHook = useWeatherData();
  const alertDataHookInstance = useAlertData();

  // UI state
  const [refreshing, setRefreshing] = useState(false);
  const staticDataFetchedRef = useRef(new Set<number>());

  // ✅ NEW: Ref để track garden ID hiện tại cho sensor polling
  const currentGardenIdRef = useRef<number | null>(null);

  // Destructure functions from sensorData for stable dependencies
  const { getSensorIconName } = sensorDataHook;

  // Destructure functions from other data hooks for stable dependencies
  const { calculateOptimalTimes, getWeatherTip } = weatherDataHook;
  const { alertsLoading, alertsError, gardenAlerts: gardenAlertsFromAlertHook } =
    alertDataHookInstance;

  useEffect(() => {
    currentGardenIdRef.current = selectedGardenId;
  }, [selectedGardenId]);

  // Callback Functions
  const loadInitialData = useCallback(async () => {
    try {
      const gardens = await gardenManagement.fetchGardens();
      if (gardens.length > 0) {
        const gardenIds = gardens.map((g) => g.id);
        if (gardenIds.length > 0) {
          await alertDataHookInstance.fetchAllGardenAlerts(gardenIds);
          gardens.forEach((garden) => {
            const alertCount = alertDataHookInstance.getActiveAlertCount(
              garden.id
            );
            gardenManagement.updateGardenAlertCount(garden.id, alertCount);
          });
        }
        if (selectedGardenId === null && gardens[0]?.id) {
          setSelectedGardenId(gardens[0].id);
        }
      }
    } catch (error) {
      console.error("useHomeData: Error loading initial data:", error);
    }
  }, []);

  const fetchStaticDataForSelectedGarden = useCallback(
    async (gardenId: number, force = false) => {
      if (!force && staticDataFetchedRef.current.has(gardenId)) {
        const currentSensorData = sensorDataHook.gardenSensorData[gardenId];
        if (currentSensorData) {
          const displaySensorData = {
            temperature: currentSensorData[SensorType.TEMPERATURE]?.[0]?.value,
            humidity: currentSensorData[SensorType.HUMIDITY]?.[0]?.value,
            soilMoisture:
              currentSensorData[SensorType.SOIL_MOISTURE]?.[0]?.value,
            light: currentSensorData[SensorType.LIGHT]?.[0]?.value,
          };
          gardenManagement.updateGardenSensorData(gardenId, displaySensorData);
        }
        return;
      }

      try {
        await Promise.all([
          weatherDataHook.fetchCompleteWeatherData(gardenId),
          weatherDataHook.fetchWeatherAdvice(gardenId),
          alertDataHookInstance.fetchGardenAlerts(gardenId),
        ]);

        const alertCount = alertDataHookInstance.getActiveAlertCount(gardenId);
        gardenManagement.updateGardenAlertCount(gardenId, alertCount);

        const currentSensorData = sensorDataHook.gardenSensorData[gardenId];
        if (currentSensorData) {
          const displaySensorData = {
            temperature: currentSensorData[SensorType.TEMPERATURE]?.[0]?.value,
            humidity: currentSensorData[SensorType.HUMIDITY]?.[0]?.value,
            soilMoisture:
              currentSensorData[SensorType.SOIL_MOISTURE]?.[0]?.value,
            light: currentSensorData[SensorType.LIGHT]?.[0]?.value,
          };
          gardenManagement.updateGardenSensorData(gardenId, displaySensorData);
        }
        staticDataFetchedRef.current.add(gardenId);
      } catch (error) {
        console.error(
          `useHomeData: Error fetching static data for garden ${gardenId}:`,
          error
        );
      }
    },
    []
  );

  // ✅ UPDATED: handleRefresh sử dụng ref
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadInitialData();
      const currentGardenId = currentGardenIdRef.current; // Use ref
      if (currentGardenId !== null) {
        staticDataFetchedRef.current.delete(currentGardenId);
        await fetchStaticDataForSelectedGarden(currentGardenId, true);
      }
    } catch (error) {
      console.error("useHomeData: Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, []); // ✅ No dependencies

  const selectGarden = useCallback(
    (gardenId: number) => {
      setSelectedGardenId(gardenId);
      gardenManagement.markGardenVisited(gardenId);
    },
    [setSelectedGardenId, gardenManagement]
  );

  const fetchGardenAdvice = useCallback(async (gardenId: number) => {
    try {
      return await gardenService.getGardenAdvice(gardenId);
    } catch (error) {
      console.error(
        `useHomeData: Error fetching garden advice for garden ${gardenId}:`,
        error
      );
      return [];
    }
  }, []);

  // Effect Hooks
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]); // loadInitialData is stable

  // ✅ NEW: Single sensor polling interval với ref
  useEffect(() => {
    const pollSensorData = () => {
      const currentId = currentGardenIdRef.current;
      if (currentId !== null) {
        sensorDataHook.fetchSensorData(currentId);
      } else {
      }
    };

    // Initial fetch for the current garden (if any)
    pollSensorData();

    // Setup interval - runs every 5 seconds
    const intervalId = setInterval(pollSensorData, 5000);

    // Cleanup function
    return () => {
      clearInterval(intervalId);
    };
  }, []); // ✅ Empty dependencies - interval created only once

  useEffect(() => {
    if (selectedGardenId !== null) {
      fetchStaticDataForSelectedGarden(selectedGardenId);
    }
  }, [selectedGardenId, fetchStaticDataForSelectedGarden]); // fetchStaticDataForSelectedGarden is stable

  // Return Values
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
    selectedGardenDetail: gardenDetailHook.garden,
    selectedGardenPlantDetails: gardenDetailHook.plantDetails,
    selectedGardenLoading: gardenDetailHook.isLoading,
    selectedGardenError: gardenDetailHook.error,
    selectedGardenPhotos: gardenDetailHook.photos,
    selectedGardenAlerts: gardenDetailHook.alerts,
    selectedGardenWateringSchedule: gardenDetailHook.wateringSchedule,
    selectedGardenCurrentWeather: gardenDetailHook.currentWeather,
    selectedGardenHourlyForecast: gardenDetailHook.hourlyForecast,
    selectedGardenDailyForecast: gardenDetailHook.dailyForecast,

    // Sensors
    gardenSensorData: sensorDataHook.gardenSensorData,
    sensorDataLoading: sensorDataHook.sensorDataLoading,
    sensorDataError: sensorDataHook.sensorDataError,
    getSensorIconName, // Stable
    getSensorStatus, // Stable import

    // Weather
    weatherData: weatherDataHook.weatherData,
    gardenWeatherData: weatherDataHook.gardenWeatherData,
    weatherAdviceByGarden: weatherDataHook.weatherAdviceByGarden,
    optimalGardenTimes: weatherDataHook.optimalGardenTimes,
    weatherDetailLoading: weatherDataHook.weatherDetailLoading,
    weatherDetailError: weatherDataHook.weatherDetailError,
    getWeatherTip, // Stable

    // Alerts
    alertsLoading, // State
    alertsError, // State

    // Alerts from alertData hook
    gardenAlerts: gardenAlertsFromAlertHook, // State

    // Functions
    selectGarden, // Stable
    handleRefresh, // Now stable deps
    fetchCompleteWeatherData: weatherDataHook.fetchCompleteWeatherData, // Expose direct stable ref
    fetchWeatherAdvice: weatherDataHook.fetchWeatherAdvice, // Expose direct stable ref
    fetchGardenAdvice, // Stable
    calculateOptimalTimes, // Stable
  };
}
