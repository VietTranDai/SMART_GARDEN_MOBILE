import { useCallback } from "react";
import alertService from "@/service/api/alert.service";
import { apiClient } from "@/service";
import { AlertStatus } from "@/types";
import Toast from "react-native-toast-message";

interface UseGardenAlertsReturn {
  handleResolveAlert: (alertId: number) => Promise<void>;
  handleIgnoreAlert: (alertId: number) => Promise<void>;
}

export const useGardenAlerts = (
  refreshData: () => void
): UseGardenAlertsReturn => {
  const handleResolveAlert = useCallback(
    async (alertId: number) => {
      try {
        await alertService.updateAlertStatus(alertId, AlertStatus.RESOLVED);

        // Refresh data to reflect changes
        refreshData();

        Toast.show({
          type: "success",
          text1: "Đã xử lý cảnh báo",
          position: "bottom",
          visibilityTime: 2000,
        });
      } catch (error) {
        console.error("Failed to resolve alert:", error);

        Toast.show({
          type: "error",
          text1: "Lỗi xử lý cảnh báo",
          text2: "Vui lòng thử lại sau",
          position: "bottom",
          visibilityTime: 3000,
        });
      }
    },
    [refreshData]
  );

  const handleIgnoreAlert = useCallback(
    async (alertId: number) => {
      try {
        // Assuming there's an API endpoint to ignore alerts
        await apiClient.post(`/alerts/${alertId}/ignore`);

        // Refresh data to reflect changes
        refreshData();

        Toast.show({
          type: "success",
          text1: "Đã bỏ qua cảnh báo",
          position: "bottom",
          visibilityTime: 2000,
        });
      } catch (error) {
        console.error("Failed to ignore alert:", error);

        Toast.show({
          type: "error",
          text1: "Lỗi bỏ qua cảnh báo",
          text2: "Vui lòng thử lại sau",
          position: "bottom",
          visibilityTime: 3000,
        });
      }
    },
    [refreshData]
  );

  return {
    handleResolveAlert,
    handleIgnoreAlert,
  };
};
