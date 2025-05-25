import { useState, useCallback } from "react";
import { Garden } from "@/types"; // Assuming Garden type is defined
import gardenService from "@/service/api/garden.service"; // Assuming gardenService is available

// Mock sensor data type for now
interface DisplaySensorData {
  temperature?: number;
  humidity?: number;
  soilMoisture?: number;
  light?: number;
}

// Define an extended type for the gardens state
export type UIGarden = Garden & {
  alertCount?: number;
  sensorDataSummary?: DisplaySensorData;
};

export interface GardenManagementHook {
  gardens: UIGarden[]; // Use UIGarden type
  isLoading: boolean;
  error: string | null;
  fetchGardens: () => Promise<UIGarden[]>; // Return UIGarden type
  markGardenVisited: (gardenId: number) => void; // This might be a local state update or an API call
  updateGardenAlertCount: (gardenId: number, count: number) => void;
  updateGardenSensorData: (gardenId: number, data: DisplaySensorData) => void;
}

export default function useGardenManagement(): GardenManagementHook {
  const [gardens, setGardens] = useState<UIGarden[]>([]); // Use UIGarden type
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGardens = useCallback(async (): Promise<UIGarden[]> => {
    // Return UIGarden type
    setIsLoading(true);
    setError(null);
    try {
      const fetchedGardens = await gardenService.getGardens(); // Assuming this returns Garden[]
      // Map to UIGarden, initializing optional properties
      const uiGardens: UIGarden[] = fetchedGardens.map((g) => ({
        ...g,
        alertCount: 0, // Initialize alertCount, as it's not on the fetched 'g' (Garden)
        // sensorDataSummary will be undefined by default as it's optional on UIGarden
      }));
      setGardens(uiGardens);
      setIsLoading(false);
      return uiGardens;
    } catch (e) {
      console.error("Error fetching gardens:", e);
      setError("Failed to fetch gardens");
      setIsLoading(false);
      return [];
    }
  }, []);

  const markGardenVisited = useCallback(async (gardenId: number) => {
    try {
      const now = new Date().toISOString();
      // Optimistically update UI first, or wait for API response
      // For now, let's wait for API response before updating UI to ensure consistency
      const updatedGarden = await gardenService.updateGarden(gardenId, {
        lastVisitedAt: now,
      });

      if (updatedGarden) {
        setGardens((prevGardens) =>
          prevGardens.map((g) =>
            g.id === gardenId
              ? {
                  ...g,
                  lastVisitedAt: now,
                  updatedAt: updatedGarden.updatedAt || now,
                }
              : g
          )
        );
      } else {
        console.warn(
          `Failed to mark garden ${gardenId} as visited via API, server did not return updated garden.`
        );
        // Optionally, could throw an error here or set a specific error state
      }
    } catch (e) {
      console.error(`Error marking garden ${gardenId} as visited:`, e);
      // Optionally, set an error state to be displayed in the UI
      // setError("Failed to mark garden as visited. Please try again.");
    }
  }, []); // Dependency array is empty as setGardens handles updates correctly and gardenService is a stable import

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
