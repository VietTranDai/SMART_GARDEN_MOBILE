import { useState, useEffect, useCallback } from "react";
import SensorService from "@/service/api/sensor.service";
import { Sensor, SensorType, SensorUnit } from "@/types/gardens/sensor.types";
import { UISensor } from "@/components/garden/GardenSensorSection";

interface UseGardenSensorsProps {
  gardenId: string | number | null;
}

interface UseGardenSensorsReturn {
  sensors: UISensor[];
  isLoading: boolean;
  error: Error | null;
  refreshSensors: () => void;
}

const POLLING_INTERVAL = 5000; // 5 seconds

export function useGardenSensors({
  gardenId,
}: UseGardenSensorsProps): UseGardenSensorsReturn {
  const [sensors, setSensors] = useState<UISensor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const mapSensorToUISensor = (apiSensors: Sensor[]): UISensor[] => {
    return apiSensors.map((s) => {
      const N_RECENT_VALUES = 5;

      const recentValues = SensorService.generateDummyTrendData(
        s.lastReading ?? 0
      ).slice(0, N_RECENT_VALUES);

      const value = s.lastReading ?? 0;
      const unit = s.unit;
      const type = s.type;

      return {
        id: Number(s.id),
        type: type as SensorType,
        name: s.name || "N/A",
        value: value,
        unit: unit as SensorUnit,
        lastReadingAt: s.lastReadingAt,
        lastUpdated: s.lastReadingAt,
        recentValues: recentValues,
      };
    });
  };

  const fetchData = useCallback(async () => {
    if (!gardenId) {
      setSensors([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const latestSensorReadings =
        await SensorService.getLatestReadingsByGarden(gardenId);

      const uiSensors = mapSensorToUISensor(latestSensorReadings || []);
      setSensors(uiSensors);
    } catch (err: any) {
      console.error("Failed to fetch garden sensors:", err);
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      setSensors([]);
    } finally {
      setIsLoading(false);
    }
  }, [gardenId]);

  useEffect(() => {
    fetchData();

    const intervalId = setInterval(() => {
      fetchData();
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [fetchData]);

  return { sensors, isLoading, error, refreshSensors: fetchData };
}
