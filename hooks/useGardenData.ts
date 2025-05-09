import { useState, useCallback } from "react";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Garden } from "@/types/gardens/garden.types";
import { GardenDisplayDto } from "@/types/gardens/dtos";
import { gardenService } from "@/service/api";

/**
 * Custom hook for garden data management
 */
export default function useGardenData() {
  const theme = useAppTheme();
  const { homePreferences, togglePinnedGarden, setLastVisitedGarden } =
    usePreferences();

  // State for gardens
  const [gardens, setGardens] = useState<GardenDisplayDto[]>([]);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all gardens
   */
  const fetchGardens = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get gardens from API
      const gardensData = await gardenService.getGardens();

      // Convert API gardens to display format with additional UI properties
      const displayGardens: GardenDisplayDto[] = gardensData.map((garden) => {
        try {
          // Check if garden is pinned in user preferences
          const isPinned = homePreferences.pinnedGardens.includes(garden.id);

          // Get last visited timestamp from preferences - fixed
          const lastVisitedAt =
            homePreferences.lastVisitedGarden === garden.id
              ? new Date().toISOString() // If this is the last visited garden, use current time
              : undefined;

          // Format location string - add null check
          const location = garden
            ? gardenService.getLocationString(garden)
            : "";

          // Get status color - fixed theme properties
          const statusColor =
            garden && garden.status === "ACTIVE" ? theme.success : theme.error;

          // Calculate growth stats - add null check
          const { daysUntilHarvest, growthProgress } = garden
            ? gardenService.calculateGardenStatistics(garden)
            : { daysUntilHarvest: 0, growthProgress: 0 };

          // Create display version with UI properties
          return {
            ...garden,
            alertCount: 0, // Will be updated by alerts system
            sensorData: {}, // Will be updated by sensor system
            location,
            isPinned,
            lastVisitedAt,
            statusColor,
            daysUntilHarvest,
            growthProgress,
          };
        } catch (itemError) {
          console.error("Error processing garden item:", garden, itemError);
          // Return a minimal valid object if processing fails
          return {
            id: garden.id || 0,
            gardenKey: garden.gardenKey || "",
            name: garden.name || "Unknown Garden",
            type: garden.type || "OUTDOOR",
            status: garden.status || "INACTIVE",
            gardenerId: garden.gardenerId || 0,
            location: "",
            alertCount: 0,
            sensorData: {},
            isPinned: false,
            statusColor: theme.error,
            daysUntilHarvest: 0,
            growthProgress: 0,
          };
        }
      });

      // Sort gardens by pinned status (pinned first), then by last visited
      displayGardens.sort((a, b) => {
        // Pinned gardens come first
        if (a.isPinned !== b.isPinned) {
          return a.isPinned ? -1 : 1;
        }

        // Then sort by last visited (most recent first)
        const aTime = a.lastVisitedAt ? new Date(a.lastVisitedAt).getTime() : 0;
        const bTime = b.lastVisitedAt ? new Date(b.lastVisitedAt).getTime() : 0;
        return bTime - aTime;
      });

      // Update state
      setGardens(displayGardens);
      return displayGardens;
    } catch (error) {
      console.error("Error fetching gardens:", error);
      setError("Không thể tải dữ liệu vườn");
      return [];
    } finally {
      setLoading(false);
    }
  }, [theme, homePreferences]);

  /**
   * Create a new garden
   */
  const createGarden = useCallback(
    async (gardenData: any) => {
      try {
        // Call API to create garden
        const newGarden = await gardenService.createGarden(gardenData);

        if (newGarden) {
          // Refresh garden list
          await fetchGardens();
          return newGarden;
        }

        return null;
      } catch (error) {
        console.error("Error creating garden:", error);
        return null;
      }
    },
    [fetchGardens]
  );

  /**
   * Update a garden
   */
  const updateGarden = useCallback(
    async (gardenId: number, gardenData: any) => {
      try {
        // Call API to update garden
        const updatedGarden = await gardenService.updateGarden(
          gardenId,
          gardenData
        );

        if (updatedGarden) {
          // Update local state
          setGardens((prev) =>
            prev.map((garden) =>
              garden.id === gardenId
                ? {
                    ...garden,
                    ...updatedGarden,
                    // Preserve UI-specific properties
                    alertCount: garden.alertCount,
                    sensorData: garden.sensorData,
                    isPinned: garden.isPinned,
                    lastVisitedAt: garden.lastVisitedAt,
                    statusColor:
                      updatedGarden.status === "ACTIVE"
                        ? theme.success
                        : theme.error,
                    location: gardenService.getLocationString(updatedGarden),
                  }
                : garden
            )
          );

          return updatedGarden;
        }

        return null;
      } catch (error) {
        console.error(`Error updating garden ${gardenId}:`, error);
        return null;
      }
    },
    [theme]
  );

  /**
   * Delete a garden
   */
  const deleteGarden = useCallback(async (gardenId: number) => {
    try {
      // Call API to delete garden
      const success = await gardenService.deleteGarden(gardenId);

      if (success) {
        // Update local state
        setGardens((prev) => prev.filter((garden) => garden.id !== gardenId));
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Error deleting garden ${gardenId}:`, error);
      return false;
    }
  }, []);

  /**
   * Toggle pinned status for a garden
   */
  const togglePinGarden = useCallback(
    (gardenId: number) => {
      // Update preferences
      togglePinnedGarden(gardenId);

      // Update local state
      setGardens((prev) =>
        prev
          .map((garden) =>
            garden.id === gardenId
              ? { ...garden, isPinned: !garden.isPinned }
              : garden
          )
          .sort((a, b) => {
            // Pinned gardens come first
            if (a.isPinned !== b.isPinned) {
              return a.isPinned ? -1 : 1;
            }

            // Then sort by last visited (most recent first)
            const aTime = a.lastVisitedAt
              ? new Date(a.lastVisitedAt).getTime()
              : 0;
            const bTime = b.lastVisitedAt
              ? new Date(b.lastVisitedAt).getTime()
              : 0;
            return bTime - aTime;
          })
      );
    },
    [togglePinnedGarden]
  );

  /**
   * Mark a garden as visited
   */
  const markGardenVisited = useCallback(
    (gardenId: number) => {
      // Update preferences - fixed to use only one parameter
      setLastVisitedGarden(gardenId);

      // Update local state
      const timestamp = new Date().toISOString();
      setGardens((prev) =>
        prev.map((garden) =>
          garden.id === gardenId
            ? { ...garden, lastVisitedAt: timestamp }
            : garden
        )
      );
    },
    [setLastVisitedGarden]
  );

  /**
   * Update sensor data for a garden
   */
  const updateGardenSensorData = useCallback(
    (gardenId: number, sensorData: any) => {
      setGardens((prev) =>
        prev.map((garden) =>
          garden.id === gardenId ? { ...garden, sensorData } : garden
        )
      );
    },
    []
  );

  /**
   * Update alert count for a garden
   */
  const updateGardenAlertCount = useCallback(
    (gardenId: number, alertCount: number) => {
      setGardens((prev) =>
        prev.map((garden) =>
          garden.id === gardenId ? { ...garden, alertCount } : garden
        )
      );
    },
    []
  );

  return {
    // Data
    gardens,

    // Status
    loading,
    error,

    // Functions
    fetchGardens,
    createGarden,
    updateGarden,
    deleteGarden,
    togglePinGarden,
    markGardenVisited,
    updateGardenSensorData,
    updateGardenAlertCount,
  };
}
