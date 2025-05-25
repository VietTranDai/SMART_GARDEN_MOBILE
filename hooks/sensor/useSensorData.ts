import { useState, useEffect, useCallback, useRef } from "react";
import { SensorType, SensorData } from "@/types/gardens/sensor.types";
import { sensorService } from "@/service/api";

// Cấu hình
const SENSOR_POLLING_INTERVAL = 5000; // 5 giây tiêu chuẩn cho sản phẩm
const MAX_READINGS_TO_KEEP = 20; // Số lượng đọc cảm biến tối đa cần lưu trữ
const MIN_POLLING_INTERVAL = 1500; // Khoảng thời gian tối thiểu giữa các lần polling (ms)

// Export sensor status function
export const getSensorStatus = sensorService.getSensorStatus;

/**
 * Custom hook quản lý dữ liệu cảm biến với polling hiệu quả và xử lý lỗi chắc chắn
 */
export default function useSensorData() {
  // State chính
  const [gardenSensorData, setGardenSensorData] = useState<
    Record<number, Record<string, SensorData[]>>
  >({});
  const [sensorDataLoading, setSensorDataLoading] = useState<
    Record<number, boolean>
  >({});
  const [sensorDataError, setSensorDataError] = useState<
    Record<number, string | null>
  >({});

  // Refs theo dõi và quản lý polling
  const lastSensorFetchTime = useRef<Record<number, number>>({});
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const watchedGardens = useRef<Set<number>>(new Set());

  /**
   * Kiểm tra mảng một cách an toàn và duy trì kiểu dữ liệu
   * @private
   */
  const safeArray = useCallback(<T>(data: unknown): T[] => {
    if (!data) return [] as T[];
    if (!Array.isArray(data)) return [] as T[];
    return data as T[];
  }, []);

  /**
   * Lấy mảng dữ liệu cảm biến một cách an toàn
   * @private
   */
  const getSafeSensorData = useCallback(
    (
      gardenData: Record<string, unknown> = {},
      sensorType: string
    ): SensorData[] => {
      if (!gardenData || typeof gardenData !== "object") return [];

      const data = gardenData[sensorType];
      return safeArray<SensorData>(data);
    },
    [safeArray]
  );

  /**
   * Bắt đầu theo dõi dữ liệu vườn (bắt đầu polling)
   */
  const startWatchingGarden = useCallback((gardenId: number) => {
    if (typeof gardenId !== "number" || isNaN(gardenId)) {
      console.warn("Invalid garden ID passed to startWatchingGarden");
      return;
    }

    watchedGardens.current.add(gardenId);

    // Nếu đây là vườn đầu tiên được theo dõi, bắt đầu polling
    if (watchedGardens.current.size === 1 && pollingTimerRef.current === null) {
      startPolling();
    }

    // Fetch dữ liệu ngay lập tức
    fetchSensorData(gardenId);
  }, []);

  /**
   * Dừng theo dõi dữ liệu vườn (dừng polling)
   */
  const stopWatchingGarden = useCallback((gardenId: number) => {
    if (typeof gardenId !== "number" || isNaN(gardenId)) return;

    watchedGardens.current.delete(gardenId);

    // Nếu không còn vườn nào được theo dõi, dừng polling
    if (watchedGardens.current.size === 0) {
      stopPolling();
    }
  }, []);

  /**
   * Bắt đầu polling cho tất cả vườn đang theo dõi
   */
  const startPolling = useCallback(() => {
    // Clear timer cũ nếu có
    if (pollingTimerRef.current !== null) {
      clearInterval(pollingTimerRef.current);
    }

    // Thiết lập timer mới
    pollingTimerRef.current = setInterval(
      pollSensorData,
      SENSOR_POLLING_INTERVAL
    );

    // console.log("Sensor polling started");
  }, []);

  /**
   * Dừng polling cho tất cả vườn
   */
  const stopPolling = useCallback(() => {
    if (pollingTimerRef.current !== null) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
      console.log("Sensor polling stopped");
    }
  }, []);

  /**
   * Poll dữ liệu cảm biến cho tất cả vườn đang theo dõi
   */
  const pollSensorData = useCallback(async () => {
    // Chỉ poll nếu có vườn đang được theo dõi
    if (watchedGardens.current.size === 0) return;

    // Poll từng vườn đang theo dõi
    for (const gardenId of Array.from(watchedGardens.current)) {
      try {
        // Giới hạn tần suất polling để tránh quá tải backend
        const now = Date.now();
        const lastFetch = lastSensorFetchTime.current[gardenId] || 0;

        // Bỏ qua nếu mới fetch trong khoảng thời gian tối thiểu trước đó
        if (now - lastFetch < MIN_POLLING_INTERVAL) {
          continue;
        }

        // Fetch dữ liệu không cần set loading state để tránh nhấp nháy giao diện
        const newData = await sensorService.getGardenSensorData(gardenId);

        // Cập nhật thời gian fetch
        lastSensorFetchTime.current[gardenId] = now;

        // Cập nhật state với dữ liệu mới
        if (newData && typeof newData === "object") {
          updateSensorData(gardenId, newData as Record<string, SensorData[]>);
        }
      } catch (error) {
        console.error(
          `Error polling sensor data for garden ${gardenId}:`,
          error
        );
        setSensorDataError((prev) => ({
          ...prev,
          [gardenId]: `Không thể tải dữ liệu cảm biến: ${error}`,
        }));
      }
    }
  }, []);

  /**
   * Fetch dữ liệu cảm biến cho một vườn cụ thể với loading indicator
   */
  const fetchSensorData = useCallback(
    async (gardenId: number, forceRefresh = false) => {
      // Kiểm tra gardenId hợp lệ
      if (typeof gardenId !== "number" || isNaN(gardenId)) {
        console.warn("Invalid garden ID passed to fetchSensorData");
        return null;
      }

      // Ngăn fetch nếu đang loading và không force refresh
      if (sensorDataLoading[gardenId] && !forceRefresh) return null;

      try {
        // Set loading state
        setSensorDataLoading((prev) => ({
          ...prev,
          [gardenId]: true,
        }));

        // Cập nhật thời gian fetch
        lastSensorFetchTime.current[gardenId] = Date.now();

        // Fetch dữ liệu
        const data = await sensorService.getGardenSensorData(gardenId);

        // Cập nhật state với kết quả
        if (data && typeof data === "object") {
          updateSensorData(gardenId, data as Record<string, SensorData[]>);
        } else {
          console.warn(
            `Received invalid sensor data format for garden ${gardenId}`,
            data
          );
        }

        // Xóa lỗi nếu có
        setSensorDataError((prev) => ({
          ...prev,
          [gardenId]: null,
        }));

        return data;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(
          `Error fetching sensor data for garden ${gardenId}:`,
          error
        );
        setSensorDataError((prev) => ({
          ...prev,
          [gardenId]: `Không thể tải dữ liệu cảm biến: ${errorMessage}`,
        }));
        return null;
      } finally {
        // Xóa loading state
        setSensorDataLoading((prev) => ({
          ...prev,
          [gardenId]: false,
        }));
      }
    },
    []
  );

  /**
   * Hàm tiện ích để sắp xếp dữ liệu cảm biến theo thời gian
   * @private
   */
  const sortSensorDataByTimestamp = useCallback(
    (data: SensorData[]): SensorData[] => {
      return [...data].sort((a, b) => {
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        return timeB - timeA;
      });
    },
    []
  );

  /**
   * Cập nhật state dữ liệu cảm biến với dữ liệu mới
   * @private
   */
  const updateSensorData = useCallback(
    (gardenId: number, newData: Record<string, SensorData[]>) => {
      if (!newData || typeof newData !== "object") {
        console.warn("Invalid sensor data received in updateSensorData");
        return;
      }

      setGardenSensorData((prev) => {
        try {
          // Tạo bản shallow copy của dữ liệu trước đó
          const prevGardenData = prev[gardenId] || {};

          // Đối tượng dữ liệu vườn mới
          const updatedGardenData: Record<string, SensorData[]> = {};

          // Xử lý từng loại cảm biến
          Object.keys(newData).forEach((sensorType) => {
            try {
              const typedSensorType = sensorType as SensorType;

              // Lấy dữ liệu mới và cũ một cách an toàn
              const newSensorData = safeArray<SensorData>(
                newData[typedSensorType]
              );
              const prevSensorData = getSafeSensorData(
                prevGardenData as Record<string, unknown>,
                typedSensorType
              );

              // Bỏ qua nếu không có dữ liệu mới
              if (newSensorData.length === 0) {
                updatedGardenData[typedSensorType] = prevSensorData;
                return;
              }

              // Sort dữ liệu mới theo timestamp
              const sortedNewData = sortSensorDataByTimestamp(newSensorData);

              // Merge và sort dữ liệu, chỉ giữ MAX_READINGS_TO_KEEP bản ghi mới nhất
              updatedGardenData[typedSensorType] = sortSensorDataByTimestamp([
                ...sortedNewData,
                ...prevSensorData,
              ]).slice(0, MAX_READINGS_TO_KEEP);
            } catch (err) {
              console.error(`Error processing sensor type ${sensorType}:`, err);
              // Fallback to previous data if error occurs for this sensor type
              updatedGardenData[sensorType as SensorType] =
                (prevGardenData[sensorType as SensorType] as SensorData[]) ||
                [];
            }
          });

          // Return state mới
          return {
            ...prev,
            [gardenId]: updatedGardenData,
          };
        } catch (error) {
          console.error("Fatal error in updateSensorData:", error);
          // Trả về state cũ nếu xảy ra lỗi nghiêm trọng
          return prev;
        }
      });
    },
    [safeArray, getSafeSensorData, sortSensorDataByTimestamp]
  );

  /**
   * Type guard để kiểm tra đối tượng có phải là SensorData
   * @private
   */
  const isSensorData = (obj: unknown): obj is SensorData => {
    return (
      typeof obj === "object" &&
      obj !== null &&
      "value" in obj &&
      "timestamp" in obj
    );
  };

  /**
   * Lấy các chỉ số mới nhất cho một vườn cụ thể
   */
  const getLatestReadings = useCallback(
    (gardenId: number): Record<string, SensorData | undefined> => {
      if (typeof gardenId !== "number" || isNaN(gardenId)) return {};

      const currentGardenData = gardenSensorData[gardenId] || {};
      const latestReadings: Record<string, SensorData | undefined> = {};

      // Lấy chỉ số mới nhất cho từng loại cảm biến
      Object.keys(currentGardenData).forEach((sensorType) => {
        try {
          const typedSensorType = sensorType as SensorType;
          const readings = safeArray<SensorData>(
            currentGardenData[typedSensorType]
          );

          if (readings.length > 0) {
            // Sort để đảm bảo lấy được chỉ số mới nhất
            const sorted = sortSensorDataByTimestamp(readings);

            // Kiểm tra nếu phần tử đầu tiên là SensorData
            if (sorted.length > 0 && isSensorData(sorted[0])) {
              latestReadings[typedSensorType] = sorted[0];
            } else {
              latestReadings[typedSensorType] = undefined;
            }
          } else {
            latestReadings[typedSensorType] = undefined;
          }
        } catch (err) {
          console.error(`Error getting latest reading for ${sensorType}:`, err);
          latestReadings[sensorType as SensorType] = undefined;
        }
      });

      return latestReadings;
    },
    [safeArray, sortSensorDataByTimestamp]
  );

  /**
   * Lấy tên icon cho loại cảm biến
   */
  const getSensorIconName = useCallback((type: SensorType): string => {
    return sensorService.getSensorIconName(type);
  }, []);

  /**
   * Lấy ngưỡng cho loại cảm biến
   */
  const getThresholdForSensorType = useCallback((type: SensorType): number => {
    switch (type) {
      case SensorType.TEMPERATURE:
        return 0.3; // Nhạy cảm với thay đổi nhiệt độ
      case SensorType.HUMIDITY:
        return 1.0;
      case SensorType.SOIL_MOISTURE:
        return 1.0;
      case SensorType.LIGHT:
        return 50; // Ánh sáng có thể dao động nhiều
      case SensorType.SOIL_PH:
        return 0.2; // Nhạy cảm với thay đổi pH
      case SensorType.WATER_LEVEL:
        return 0.05; // Nhạy cảm với thay đổi mực nước
      default:
        return 1.0;
    }
  }, []);

  /**
   * Dọn dẹp khi component unmount
   */
  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, []);

  return {
    // Dữ liệu
    gardenSensorData,

    // Trạng thái
    sensorDataLoading,
    sensorDataError,

    // Tiện ích
    getSensorIconName,
    getSensorStatus: sensorService.getSensorStatus,
    getThresholdForSensorType,

    // Functions
    fetchSensorData,
    getLatestReadings,
    startWatchingGarden,
    stopWatchingGarden,
    startPolling,
    stopPolling,
  };
}
