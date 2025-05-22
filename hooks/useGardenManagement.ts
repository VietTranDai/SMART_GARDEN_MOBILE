import { useState, useCallback } from "react";
import { apiClient } from "@/service"; // Assuming apiClient is configured
import { Garden } from "@/types"; // Assuming Garden type is defined
import gardenService from "@/service/api/garden.service"; // Assuming gardenService is available

// Mock sensor data type for now
interface DisplaySensorData {
  temperature?: number;
  humidity?: number;
  soilMoisture?: number;
  light?: number;
}

export interface GardenManagementHook {
  gardens: Garden[];
  isLoading: boolean;
  error: string | null;
  fetchGardens: () => Promise<Garden[]>;
  markGardenVisited: (gardenId: number) => void; // This might be a local state update or an API call
  updateGardenAlertCount: (gardenId: number, count: number) => void;
  updateGardenSensorData: (gardenId: number, data: DisplaySensorData) => void;
}

export default function useGardenManagement(): GardenManagementHook {
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGardens = useCallback(async (): Promise<Garden[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedGardens = await gardenService.getGardens(); // Assuming this service function exists
      setGardens(fetchedGardens);
      setIsLoading(false);
      return fetchedGardens;
    } catch (e) {
      console.error("Error fetching gardens:", e);
      setError("Failed to fetch gardens");
      setIsLoading(false);
      return [];
    }
  }, []);

  const markGardenVisited = useCallback((gardenId: number) => {
    // Placeholder: Implement actual logic, e.g., update local storage or make an API call
    console.log(`Garden ${gardenId} marked as visited.`);
    // Example: Update garden state if needed
    // setGardens(prevGardens => prevGardens.map(g => g.id === gardenId ? { ...g, visited: true } : g));
  }, []);

  const updateGardenAlertCount = useCallback(
    (gardenId: number, count: number) => {
      setGardens((prevGardens) =>
        prevGardens.map((g) =>
          g.id === gardenId ? { ...g, alertCount: count } : g
        )
      );
    },
    []
  );

  const updateGardenSensorData = useCallback(
    (gardenId: number, data: DisplaySensorData) => {
      setGardens((prevGardens) =>
        prevGardens.map((g) =>
          g.id === gardenId ? { ...g, sensorDataSummary: data } : g
        )
      );
    },
    []
  );

  return {
    gardens,
    isLoading,
    error,
    fetchGardens,
    markGardenVisited,
    updateGardenAlertCount,
    updateGardenSensorData,
  };
}
