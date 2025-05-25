import React, {
  useMemo,
  useRef,
  useCallback,
  useEffect,
  useState,
  memo,
} from "react";
import {
  RefreshControl,
  Animated,
  Text,
  View,
  TouchableOpacity,
  FlexAlignType,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { Ionicons } from "@expo/vector-icons";

// Import custom hooks
import useHomeData from "@/hooks/useHomeData";
import { useGardenContext } from "@/contexts/GardenContext";

// Import styles
import { makeHomeStyles } from "@/components/common/styles";

// Import UI components
import GardenDisplay from "@/components/common/GardenDisplay";
import WeatherDisplay from "@/components/common/WeatherDisplay";
import AlertCenter from "@/components/home/AlertCenter";
import ActivityTimeline from "@/components/home/ActivityTimeline";
import LoadingView from "@/components/common/LoadingView";
import ErrorView from "@/components/common/ErrorView";
import EmptyGardensView from "@/components/common/EmptyGardensView";
import AdviceModal from "@/components/common/AdviceModal";
import WeatherDetailModal from "@/components/common/WeatherDetailModal";
import AlertDetailsModal from "@/components/common/AlertDetailsModal";
import { GardenProvider } from "@/contexts/GardenContext";
import HomeSections, {
  SectionType,
  SectionConfig,
} from "@/components/home/HomeSections";

// Import types
import { SensorData, SensorType } from "@/types/gardens/sensor.types";
import { GardenDisplayDto } from "@/types/gardens/dtos";
import {
  WeatherObservation,
  HourlyForecast,
  DailyForecast,
  GardenWeatherData,
} from "@/types/weather/weather.types";
import { Alert } from "@/types/alerts/alert.types";
import {
  ActivityDisplay,
  ScheduleDisplay,
} from "@/types/activities/activity.types";

// Import getSensorStatus from the useSensorData hook
// import { getSensorStatus } from "@/hooks/useSensorData"; // This is not used directly here, passed from useHomeData
import { GardenAdvice } from "@/types";

// Structure for the main FlatList data
interface Section {
  type: SectionType;
  key: string;
}

// Cập nhật styles để thêm các thuộc tính thiếu với typing đúng
const extendedHomeStyles = (theme: any) => {
  const baseStyles = makeHomeStyles(theme);
  return {
    ...baseStyles,
    sectionAction: {
      flexDirection: "row" as const,
      alignItems: "center" as FlexAlignType,
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    sectionActionText: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      marginRight: 4,
    },
    emptyContainer: {
      alignItems: "center" as const,
      justifyContent: "center" as const,
      padding: 20,
    },
    emptyText: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      textAlign: "center" as const,
    },
  };
};

// Thêm interfaces cho props của các memo components với types cập nhật
interface GardenSectionProps {
  gardens: GardenDisplayDto[];
  onTogglePinGarden: (gardenId: number) => void;
  onShowAdvice: (gardenId: number) => void;
  onShowWeatherDetail: (gardenId: number) => void;
  onScrollToWeatherSection: (gardenId: number) => void;
  onShowAlertDetails: (gardenId: number) => void;
  sensorDataByGarden: Record<number, Record<string, SensorData[]>>;
  weatherDataByGarden: Record<number, GardenWeatherData>;
  adviceLoading: Record<number, boolean>;
  weatherDetailLoading: Record<number, boolean>;
  animationValue: Animated.Value;
  theme: any;
  getSensorStatus?: (
    value: number,
    type: SensorType
  ) => "normal" | "warning" | "critical";
  showLargeCards: boolean;
  onSelectGarden: (gardenId: number) => void;
}

interface WeatherSectionProps {
  currentWeather: WeatherObservation | null;
  selectedGarden: GardenDisplayDto | undefined;
  hourlyForecast: HourlyForecast[];
  dailyForecast: DailyForecast[];
  getWeatherTip: any;
  showFullDetails: boolean;
  onShowWeatherDetail: () => void;
  animationValue: Animated.Value;
  theme: any;
}

interface AlertSectionProps {
  selectedGardenId: number | null;
  gardenAlerts: Record<number, Alert[]>;
  animationValue: Animated.Value;
  theme: any;
}

interface ActivitySectionProps {
  recentActivities: ActivityDisplay[];
  upcomingSchedules: ScheduleDisplay[];
  selectedGardenId: number | null;
  animationValue: Animated.Value;
  theme: any;
}

// Define the props for DynamicSections
interface DynamicSectionsProps {
  sections: Section[];
  weatherData: WeatherObservation | null;
  selectedGardenId: number | null;
  sectionAnimations: {
    gardens: Animated.Value;
    weather: Animated.Value;
    activity: Animated.Value;
  };
  gardenAlerts: Record<number, Alert[]>;
  recentActivities: ActivityDisplay[];
  upcomingSchedules: ScheduleDisplay[];
  gardenWeatherData: Record<number, GardenWeatherData>;
  theme: any;
  handleShowWeatherDetail: (gardenId: number | null) => void;
  getWeatherTip: (weather: WeatherObservation) => string;
  gardens: GardenDisplayDto[];
}

// Cập nhật các utility functions để kiểm tra thật kỹ
/**
 * Kiểm tra xem một đối tượng có phải là mảng hợp lệ hay không
 */
// const isValidArray = (data: any): boolean => {
//   return Array.isArray(data);
// };

/**
 * Kiểm tra xem một đối tượng có phải là mảng hợp lệ và có phần tử hay không
 */
// const hasItems = (data: any): boolean => {
//   return Array.isArray(data) && data.length > 0;
// };

/**
 * Kiểm tra xem một key có tồn tại trong một đối tượng hay không
 */
// const hasValidProperty = (obj: any, key: string | number): boolean => {
//   return obj && typeof obj === "object" && key in obj;
// };

/**
 * Lấy mảng an toàn từ một đối tượng, trả về mảng rỗng nếu không hợp lệ
 */
// const getSafeArray = (data: any): any[] => {
//   if (!Array.isArray(data)) return [];
//   return data.filter((item: any) => item && typeof item === "object");
// };

/**
 * Lấy mảng các giá trị từ đối tượng một cách an toàn
 */
const getSafeObjectValues = (obj: any): any[] => {
  if (!obj || typeof obj !== "object") return [];
  try {
    const values = Object.values(obj);
    if (!Array.isArray(values)) return [];
    return values;
  } catch (error) {
    console.error("Error in getSafeObjectValues:", error);
    return [];
  }
};

/**
 * Làm phẳng mảng một cách an toàn
 */
// const safeArrayFlat = (arr: any[]): any[] => {
//   if (!Array.isArray(arr)) return [];
//   try {
//     // Cách an toàn hơn để làm phẳng mảng
//     const result: any[] = [];
//     for (let i = 0; i < arr.length; i++) {
//       const item = arr[i];
//       if (Array.isArray(item)) {
//         for (let j = 0; j < item.length; j++) {
//           if (item[j] !== undefined && item[j] !== null) {
//             result.push(item[j]);
//           }
//         }
//       } else if (item !== undefined && item !== null) {
//         result.push(item);
//       }
//     }
//     return result;
//   } catch (error) {
//     console.error("Error in safeArrayFlat:", error);
//     return [];
//   }
// };

// Sửa đổi các component memos để sử dụng interfaces và các utility functions
const GardenSection = memo((props: GardenSectionProps) => {
  const {
    gardens,
    onTogglePinGarden,
    onShowAdvice,
    onShowWeatherDetail,
    onScrollToWeatherSection,
    onShowAlertDetails,
    sensorDataByGarden,
    weatherDataByGarden,
    adviceLoading,
    weatherDetailLoading,
    animationValue,
    theme,
    getSensorStatus,
    showLargeCards,
    onSelectGarden,
  } = props;

  const styles = useMemo(() => extendedHomeStyles(theme), [theme]);

  const animatedStyle = {
    opacity: animationValue,
    transform: [
      {
        translateY: animationValue.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  // Xác thực dữ liệu sensor để đảm bảo hiển thị đúng trong garden card
  const validatedSensorData = useMemo(() => {
    if (!sensorDataByGarden || typeof sensorDataByGarden !== "object") {
      console.log("sensorDataByGarden is invalid:", sensorDataByGarden);
      return {};
    }

    console.log("sensorDataByGarden", sensorDataByGarden);

    // Tạo một đối tượng mới để tránh thay đổi object gốc
    const result: Record<number, Record<string, any[]>> = {};

    // Duyệt qua tất cả các garden id trong sensorDataByGarden
    Object.keys(sensorDataByGarden).forEach((gardenIdStr) => {
      const gardenId = Number(gardenIdStr);
      if (!isNaN(gardenId)) {
        // Đảm bảo dữ liệu sensor cho mỗi garden là hợp lệ
        const gardenSensors = sensorDataByGarden[gardenId];
        if (gardenSensors && typeof gardenSensors === "object") {
          result[gardenId] = {};

          // Duyệt qua các loại sensor
          Object.keys(gardenSensors).forEach((sensorTypeKey) => {
            // Đảm bảo dữ liệu của mỗi loại sensor là một mảng
            const sensorData = gardenSensors[sensorTypeKey];

            // Nếu sensorTypeKey là SensorType enum, chuyển nó thành string
            const typeKey = sensorTypeKey.toString();

            if (Array.isArray(sensorData)) {
              // Lọc những sensor data không hợp lệ
              const validSensorData = sensorData.filter(
                (item) =>
                  item &&
                  typeof item === "object" &&
                  "value" in item &&
                  typeof item.value === "number"
              );

              result[gardenId][typeKey] = validSensorData;
            } else {
              result[gardenId][typeKey] = [];
            }
          });
        }
      }
    });

    return result;
  }, [sensorDataByGarden]);

  return (
    <Animated.View style={[styles.section, animatedStyle]}>
      <GardenDisplay
        gardens={gardens}
        onTogglePinGarden={onTogglePinGarden}
        onShowAdvice={onShowAdvice}
        onShowWeatherDetail={onShowWeatherDetail}
        onScrollToWeatherSection={onScrollToWeatherSection}
        onShowAlertDetails={onShowAlertDetails}
        sensorDataByGarden={validatedSensorData}
        weatherDataByGarden={weatherDataByGarden}
        getSensorStatus={getSensorStatus}
        showLargeCards={showLargeCards}
        adviceLoading={adviceLoading}
        weatherDetailLoading={weatherDetailLoading}
        onSelectGarden={onSelectGarden}
      />
    </Animated.View>
  );
});

const WeatherSection = memo((props: WeatherSectionProps) => {
  const {
    currentWeather,
    selectedGarden,
    hourlyForecast,
    dailyForecast,
    getWeatherTip,
    showFullDetails,
    onShowWeatherDetail,
    animationValue,
    theme,
  } = props;

  const styles = useMemo(() => extendedHomeStyles(theme), [theme]);

  const animatedStyle = {
    opacity: animationValue,
    transform: [
      {
        translateY: animationValue.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  const weatherData = useMemo(() => {
    return {
      current: currentWeather,
      hourly: Array.isArray(hourlyForecast) ? hourlyForecast : [],
      daily: Array.isArray(dailyForecast) ? dailyForecast : [],
    };
  }, [currentWeather, hourlyForecast, dailyForecast]);

  return (
    <Animated.View style={[styles.section, animatedStyle]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {selectedGarden ? `Thời tiết - ${selectedGarden.name}` : "Thời tiết"}
        </Text>
        {showFullDetails && (
          <TouchableOpacity
            style={styles.sectionAction}
            onPress={onShowWeatherDetail}
          >
            <Text style={[styles.sectionActionText, { color: theme.primary }]}>
              Chi tiết
            </Text>
            <Ionicons name="chevron-forward" size={16} color={theme.primary} />
          </TouchableOpacity>
        )}
      </View>
      <WeatherDisplay
        currentWeather={weatherData.current}
        selectedGarden={selectedGarden}
        hourlyForecast={weatherData.hourly}
        dailyForecast={weatherData.daily}
        getWeatherTip={getWeatherTip}
        showFullDetails={showFullDetails}
        onShowDetail={onShowWeatherDetail}
      />
    </Animated.View>
  );
});

const AlertSection = memo((props: AlertSectionProps) => {
  const { selectedGardenId, gardenAlerts, animationValue, theme } = props;

  const styles = useMemo(() => extendedHomeStyles(theme), [theme]);

  const animatedStyle = {
    opacity: animationValue,
    transform: [
      {
        translateY: animationValue.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  const safeAlerts = useMemo(() => {
    if (
      !gardenAlerts ||
      typeof gardenAlerts !== "object" ||
      selectedGardenId === null
    ) {
      return {};
    }

    const result: Record<number, Alert[]> = {};
    if (selectedGardenId in gardenAlerts) {
      const alerts = gardenAlerts[selectedGardenId];
      result[selectedGardenId] = Array.isArray(alerts) ? [...alerts] : [];
    }

    return result;
  }, [gardenAlerts, selectedGardenId]);

  return (
    <Animated.View style={[styles.section, animatedStyle]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Thông báo
        </Text>
      </View>
      <AlertCenter selectedGardenId={selectedGardenId} alerts={safeAlerts} />
    </Animated.View>
  );
});

const ActivitySection = memo((props: ActivitySectionProps) => {
  const {
    recentActivities,
    upcomingSchedules,
    selectedGardenId,
    animationValue,
    theme,
  } = props;

  const styles = useMemo(() => extendedHomeStyles(theme), [theme]);

  const animatedStyle = {
    opacity: animationValue,
    transform: [
      {
        translateY: animationValue.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  const safeRecentActivities = useMemo(() => {
    return Array.isArray(recentActivities) ? recentActivities : [];
  }, [recentActivities]);

  const safeUpcomingSchedules = useMemo(() => {
    return Array.isArray(upcomingSchedules) ? upcomingSchedules : [];
  }, [upcomingSchedules]);

  return (
    <Animated.View style={[styles.section, animatedStyle]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Hoạt động
        </Text>
      </View>
      <ActivityTimeline
        recentActivities={safeRecentActivities}
        upcomingSchedules={safeUpcomingSchedules}
        selectedGardenId={selectedGardenId}
      />
    </Animated.View>
  );
});

// Update DynamicSections to use the defined props
const DynamicSections = memo((props: DynamicSectionsProps) => {
  const {
    sections,
    weatherData,
    selectedGardenId,
    sectionAnimations,
    gardenAlerts,
    recentActivities,
    upcomingSchedules,
    gardenWeatherData,
    theme,
    handleShowWeatherDetail,
    getWeatherTip,
    gardens,
  } = props;

  // Tối ưu: Tách logic lấy selected garden ra khỏi render
  const selectedGarden = useMemo(() => {
    // Đảm bảo gardens là một mảng hợp lệ
    if (!Array.isArray(gardens) || gardens.length === 0) {
      return undefined;
    }
    // Đảm bảo selectedGardenId không phải là null hoặc undefined
    if (selectedGardenId === null || selectedGardenId === undefined) {
      return undefined;
    }
    return gardens.find((g) => g.id === selectedGardenId);
  }, [gardens, selectedGardenId]);

  // Tối ưu: Tách logic lấy weather data ra khỏi render với kiểm tra an toàn
  const currentWeatherData = useMemo(() => {
    try {
      // Kiểm tra kỹ lưỡng các giá trị null và undefined
      if (
        selectedGardenId === null ||
        selectedGardenId === undefined ||
        !gardenWeatherData ||
        typeof gardenWeatherData !== "object"
      ) {
        return weatherData || null;
      }

      // Kiểm tra an toàn khi truy cập gardenWeatherData[selectedGardenId]
      const hasGardenData = Object.prototype.hasOwnProperty.call(
        gardenWeatherData,
        selectedGardenId
      );
      if (!hasGardenData || !gardenWeatherData[selectedGardenId]?.current) {
        return weatherData || null;
      }

      return gardenWeatherData[selectedGardenId].current;
    } catch (error) {
      console.error("Error getting current weather data:", error);
      return weatherData || null;
    }
  }, [selectedGardenId, gardenWeatherData, weatherData]);

  // Tối ưu: Tách logic lấy forecast data ra khỏi render với kiểm tra an toàn
  const forecastData = useMemo(() => {
    try {
      const defaultData = { hourly: [], daily: [] };

      if (
        !selectedGardenId ||
        !gardenWeatherData ||
        typeof gardenWeatherData !== "object" ||
        !(selectedGardenId in gardenWeatherData)
      ) {
        return defaultData;
      }

      const garden = gardenWeatherData[selectedGardenId];

      // Safe check for hourly data
      const hourly =
        garden.hourly && Array.isArray(garden.hourly) ? [...garden.hourly] : [];

      // Safe check for daily data
      const daily =
        garden.daily && Array.isArray(garden.daily) ? [...garden.daily] : [];

      return { hourly, daily };
    } catch (error) {
      console.error("Error getting forecast data:", error);
      return { hourly: [], daily: [] };
    }
  }, [selectedGardenId, gardenWeatherData]);

  // Cập nhật renderWeatherSection để kiểm tra an toàn selectedGarden
  const renderWeatherSection = useCallback(() => {
    const isSelectedGarden = !!selectedGardenId && !!selectedGarden;

    return (
      <WeatherSection
        currentWeather={currentWeatherData}
        selectedGarden={selectedGarden}
        hourlyForecast={forecastData.hourly || []}
        dailyForecast={forecastData.daily || []}
        getWeatherTip={getWeatherTip}
        showFullDetails={isSelectedGarden}
        onShowWeatherDetail={() =>
          selectedGardenId ? handleShowWeatherDetail(selectedGardenId) : null
        }
        animationValue={sectionAnimations.weather}
        theme={theme}
      />
    );
  }, [
    selectedGardenId,
    selectedGarden,
    currentWeatherData,
    forecastData,
    getWeatherTip,
    handleShowWeatherDetail,
    sectionAnimations.weather,
    theme,
  ]);

  const renderActivitySection = useCallback(() => {
    // Ensure recentActivities and upcomingSchedules are arrays
    const safeRecentActivities = Array.isArray(recentActivities)
      ? recentActivities
      : [];
    const safeUpcomingSchedules = Array.isArray(upcomingSchedules)
      ? upcomingSchedules
      : [];

    return (
      <ActivitySection
        recentActivities={safeRecentActivities}
        upcomingSchedules={safeUpcomingSchedules}
        selectedGardenId={selectedGardenId}
        animationValue={sectionAnimations.activity}
        theme={theme}
      />
    );
  }, [
    recentActivities,
    upcomingSchedules,
    selectedGardenId,
    sectionAnimations.activity,
    theme,
  ]);

  const renderSection = useCallback(
    ({ item, index }: { item: Section; index: number }) => {
      switch (item.type) {
        case SectionType.WEATHER:
          return renderWeatherSection();
        case SectionType.ACTIVITY:
          return renderActivitySection();
        default:
          return null;
      }
    },
    [renderWeatherSection, renderActivitySection]
  );

  // Use try-catch to protect against any iteration errors
  try {
    return (
      <>
        {sections
          .filter((section: Section) => section.type !== SectionType.GARDENS)
          .map((section: Section, index: number) => (
            <React.Fragment key={`section-${section.type}-${index}`}>
              {renderSection({ item: section, index })}
            </React.Fragment>
          ))}
      </>
    );
  } catch (error) {
    console.error("Error rendering DynamicSections:", error);
    return null; // Return empty if there's an error
  }
});

// Rename HomeScreen thành HomeScreenContent và giữ lại logic
function HomeScreenContent() {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  // Use ScrollView ref instead of FlatList
  const scrollViewRef = useRef<ScrollView>(null);

  // Tracking refs
  const hasInitialFetch = useRef(false);
  const lastFetchTime = useRef(Date.now());

  // Use context for garden selection
  const { selectedGardenId, selectGarden } = useGardenContext();

  // Get all data from our custom hook
  const {
    loading,
    error,
    refreshing,
    gardens,
    weatherData,
    gardenAlerts,
    getWeatherTip,
    getSensorIconName,
    getSensorStatus,
    recentActivities,
    upcomingSchedules,
    handleRefresh,
    gardenSensorData,
    weatherAdviceByGarden,
    fetchWeatherAdvice,
    weatherDetailLoading,
    weatherDetailError,
    gardenWeatherData,
    optimalGardenTimes,
    calculateOptimalTimes,
    fetchCompleteWeatherData,
    fetchGardenAdvice,
  } = useHomeData();

  // State for modals
  const [adviceModalVisible, setAdviceModalVisible] = useState(false);
  const [selectedGardenForAdvice, setSelectedGardenForAdvice] = useState<
    number | null
  >(null);
  const [weatherDetailVisible, setWeatherDetailVisible] = useState(false);
  const [selectedGardenForWeather, setSelectedGardenForWeather] = useState<
    number | null
  >(null);
  const [alertDetailVisible, setAlertDetailVisible] = useState(false);
  const [selectedGardenForAlerts, setSelectedGardenForAlerts] = useState<
    number | null
  >(null);

  // Animation ref for refresh control
  const refreshAnimationRef = useRef(new Animated.Value(0));

  // Section animations
  const sectionAnimations = {
    gardens: useRef(new Animated.Value(0)).current,
    weather: useRef(new Animated.Value(0)).current,
    activity: useRef(new Animated.Value(0)).current,
  };

  // Animation when rendering sections
  useEffect(() => {
    if (!loading && gardens.length > 0) {
      // Animate sections sequentially
      Animated.stagger(100, [
        Animated.timing(sectionAnimations.gardens, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(sectionAnimations.weather, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(sectionAnimations.activity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, gardens, sectionAnimations]);

  // Animation for refresh
  const animateRefresh = useCallback(() => {
    refreshAnimationRef.current.setValue(0);
    Animated.timing(refreshAnimationRef.current, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Enhanced onRefresh with debounce protection
  const onRefresh = useCallback(async () => {
    // Prevent too frequent refreshes
    const now = Date.now();
    if (now - lastFetchTime.current < 10000) {
      // 10s debounce
      console.log("Debouncing refresh - too frequent");
      return;
    }

    lastFetchTime.current = now;
    animateRefresh();
    await handleRefresh();

    // Reset animations after refresh - safer approach
    if (sectionAnimations && typeof sectionAnimations === "object") {
      try {
        const animValues = getSafeObjectValues(sectionAnimations);
        animValues.forEach((anim) => {
          if (anim && typeof anim.setValue === "function") {
            anim.setValue(0);
          }
        });
      } catch (error) {
        console.error("Error resetting animations:", error);
      }
    }

    // Re-animate sections after data loads
    setTimeout(() => {
      // Animate sections sequentially
      Animated.stagger(100, [
        Animated.timing(sectionAnimations.gardens, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(sectionAnimations.weather, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(sectionAnimations.activity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, 100);
  }, [handleRefresh, animateRefresh, sectionAnimations]);

  // Initial fetch when component mounts
  useEffect(() => {
    if (!hasInitialFetch.current && !loading && !refreshing) {
      // Avoid calling API too frequently
      const now = Date.now();
      if (now - lastFetchTime.current < 10000) {
        // 10s debounce
        return;
      }

      lastFetchTime.current = now;
      hasInitialFetch.current = true;
      handleRefresh();
    }
  }, [handleRefresh, loading, refreshing]);

  // Auto-fetch weather data when selecting a new garden
  useEffect(() => {
    if (selectedGardenId) {
      fetchWeatherForGarden(selectedGardenId);
    }
  }, [selectedGardenId]);

  // Handler for fetching weather data for a garden
  const fetchWeatherForGarden = useCallback(
    async (gardenId: number) => {
      try {
        // Kiểm tra gardenId có hợp lệ không
        if (gardenId === null || gardenId === undefined || isNaN(gardenId)) {
          console.log("Invalid garden ID, skipping weather fetch");
          return;
        }

        // Kiểm tra gardenWeatherData có tồn tại không
        if (!gardenWeatherData || typeof gardenWeatherData !== "object") {
          await fetchCompleteWeatherData(gardenId);
        }
        // Nếu gardenWeatherData tồn tại, kiểm tra xem có dữ liệu cho garden id này không
        else if (!(gardenId in gardenWeatherData)) {
          await fetchCompleteWeatherData(gardenId);
        }

        // Fetch weather advice nếu cần
        if (
          !weatherAdviceByGarden ||
          typeof weatherAdviceByGarden !== "object" ||
          (!weatherAdviceByGarden[gardenId] &&
            (!weatherDetailLoading || !weatherDetailLoading[gardenId]))
        ) {
          await fetchWeatherAdvice(gardenId);
        }

        // Calculate optimal times nếu có hourly data
        if (
          gardenWeatherData &&
          typeof gardenWeatherData === "object" &&
          gardenId in gardenWeatherData &&
          gardenWeatherData[gardenId]?.hourly &&
          (!optimalGardenTimes ||
            typeof optimalGardenTimes !== "object" ||
            !optimalGardenTimes[gardenId] ||
            !optimalGardenTimes[gardenId]?.WATERING)
        ) {
          await calculateOptimalTimes(gardenId, "WATERING");
        }
      } catch (error) {
        console.error("Error in fetchWeatherForGarden:", error);
      }
    },
    [
      fetchCompleteWeatherData,
      fetchWeatherAdvice,
      calculateOptimalTimes,
      gardenWeatherData,
      weatherAdviceByGarden,
      weatherDetailLoading,
      optimalGardenTimes,
    ]
  );

  // Handle showing advice modal
  const handleShowAdvice = useCallback(
    async (gardenId: number) => {
      // Kiểm tra gardenId có hợp lệ không
      if (gardenId === null || gardenId === undefined || isNaN(gardenId)) {
        console.log("Invalid garden ID, skipping advice modal");
        return;
      }

      setSelectedGardenForAdvice(gardenId);

      // Set loading state
      setGardenAdviceLoading((prev) => ({
        ...prev,
        [gardenId]: true,
      }));

      try {
        // Fetch garden advice (not weather advice)
        const advice = await fetchGardenAdvice(gardenId);

        // Store advice in state
        setGardenAdviceByGarden((prev) => ({
          ...prev,
          [gardenId]: advice,
        }));

        // Clear any errors
        setGardenAdviceError((prev) => ({
          ...prev,
          [gardenId]: null,
        }));
      } catch (error) {
        console.error(
          `Error fetching garden advice for garden ${gardenId}:`,
          error
        );
        setGardenAdviceError((prev) => ({
          ...prev,
          [gardenId]: `Không thể tải lời khuyên: ${error}`,
        }));
      } finally {
        // Clear loading state
        setGardenAdviceLoading((prev) => ({
          ...prev,
          [gardenId]: false,
        }));
      }

      setAdviceModalVisible(true);
    },
    [fetchGardenAdvice]
  );

  // Handle showing weather detail modal
  const handleShowWeatherDetail = useCallback(
    async (gardenId: number) => {
      // Kiểm tra gardenId có hợp lệ không
      if (gardenId === null || gardenId === undefined || isNaN(gardenId)) {
        console.log("Invalid garden ID, skipping weather detail");
        return;
      }

      setSelectedGardenForWeather(gardenId);

      // Đảm bảo gardenWeatherData hợp lệ
      if (!gardenWeatherData || typeof gardenWeatherData !== "object") {
        await fetchCompleteWeatherData(gardenId);
      }
      // Fetch complete weather data if needed
      else if (!gardenWeatherData[gardenId]?.current) {
        await fetchCompleteWeatherData(gardenId);
      }

      // Đảm bảo weatherAdviceByGarden hợp lệ
      if (
        !weatherAdviceByGarden ||
        typeof weatherAdviceByGarden !== "object" ||
        (!weatherAdviceByGarden[gardenId] &&
          (!weatherDetailLoading || !weatherDetailLoading[gardenId]))
      ) {
        await fetchWeatherAdvice(gardenId);
      }

      // Đảm bảo optimalGardenTimes hợp lệ
      if (
        gardenWeatherData &&
        typeof gardenWeatherData === "object" &&
        gardenId in gardenWeatherData &&
        gardenWeatherData[gardenId]?.hourly &&
        (!optimalGardenTimes ||
          typeof optimalGardenTimes !== "object" ||
          !optimalGardenTimes[gardenId] ||
          !optimalGardenTimes[gardenId]?.WATERING)
      ) {
        await calculateOptimalTimes(gardenId, "WATERING");
      }

      setWeatherDetailVisible(true);
    },
    [
      gardenWeatherData,
      weatherAdviceByGarden,
      weatherDetailLoading,
      fetchCompleteWeatherData,
      fetchWeatherAdvice,
      calculateOptimalTimes,
      optimalGardenTimes,
    ]
  );

  // Handle showing alert details modal
  const handleShowAlertDetails = useCallback((gardenId: number) => {
    // Kiểm tra gardenId có hợp lệ không
    if (gardenId === null || gardenId === undefined || isNaN(gardenId)) {
      console.log("Invalid garden ID, skipping alert details");
      return;
    }

    setSelectedGardenForAlerts(gardenId);
    setAlertDetailVisible(true);
  }, []);

  // Scroll to weather section
  const handleScrollToWeatherSection = useCallback(
    (gardenId: number) => {
      // Kiểm tra gardenId có hợp lệ không
      if (gardenId === null || gardenId === undefined || isNaN(gardenId)) {
        console.log("Invalid garden ID, skipping scroll to weather");
        return;
      }

      // Select garden to display its weather
      selectGarden(gardenId);

      // Use timeout to ensure garden selection is processed
      setTimeout(() => {
        // Scroll down to where weather section would be
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            y: 300, // Approximate position of weather section
            animated: true,
          });
        }
      }, 100);
    },
    [selectGarden]
  );

  // Cập nhật sections để kiểm tra rõ ràng hơn khi không có vườn được chọn
  const sections = useMemo(() => {
    // Danh sách các sections sẽ hiển thị
    const visibleSections: SectionConfig[] = [
      { type: SectionType.GARDENS, visible: true },
    ];

    // Kiểm tra kỹ lưỡng nếu có một vườn được chọn hợp lệ
    const hasValidGardenSelected =
      selectedGardenId !== null &&
      selectedGardenId !== undefined &&
      Array.isArray(gardens) &&
      gardens.some((g) => g.id === selectedGardenId);

    // Luôn hiển thị phần thời tiết khi có một vườn được chọn hợp lệ
    if (hasValidGardenSelected) {
      visibleSections.push({ type: SectionType.WEATHER, visible: true });
    }

    // Show activity section if there are activities or schedules và có vườn được chọn hợp lệ
    if (
      hasValidGardenSelected &&
      ((Array.isArray(recentActivities) && recentActivities.length > 0) ||
        (Array.isArray(upcomingSchedules) && upcomingSchedules.length > 0))
    ) {
      visibleSections.push({ type: SectionType.ACTIVITY, visible: true });
    }

    return visibleSections;
  }, [selectedGardenId, gardens, recentActivities, upcomingSchedules]);

  // Get selected garden for display in modals
  const selectedGardenName = useMemo(() => {
    if (!selectedGardenForAdvice || !Array.isArray(gardens)) return "";
    const garden = gardens.find((g) => g.id === selectedGardenForAdvice);
    return garden ? garden.name : "";
  }, [selectedGardenForAdvice, gardens]);

  const selectedGardenForModal = useMemo(() => {
    if (!selectedGardenForWeather || !Array.isArray(gardens)) return undefined;
    return gardens.find((g) => g.id === selectedGardenForWeather);
  }, [selectedGardenForWeather, gardens]);

  // After the existing state declarations, add:
  const [gardenAdviceByGarden, setGardenAdviceByGarden] = useState<
    Record<number, GardenAdvice[]>
  >({});
  const [gardenAdviceLoading, setGardenAdviceLoading] = useState<
    Record<number, boolean>
  >({});
  const [gardenAdviceError, setGardenAdviceError] = useState<
    Record<number, string | null>
  >({});

  // If loading, show loading indicator
  if (loading && !refreshing) {
    return <LoadingView message="Đang tải dữ liệu..." />;
  }

  // If there's an error, show error view
  if (error) {
    return <ErrorView message={error} onRetry={handleRefresh} />;
  }

  // If there are no gardens and we're not loading, show empty gardens view
  if (gardens.length === 0 && !loading) {
    return <EmptyGardensView />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      >
        {/* Render all sections using the new HomeSections component */}
        <HomeSections
          gardens={
            Array.isArray(gardens) ? (gardens as any as GardenDisplayDto[]) : []
          }
          selectedGardenId={selectedGardenId}
          onSelectGarden={selectGarden}
          sections={sections}
          sensorDataByGarden={gardenSensorData || {}}
          weatherData={weatherData}
          gardenWeatherData={gardenWeatherData || {}}
          gardenAlerts={gardenAlerts || {}}
          recentActivities={
            Array.isArray(recentActivities) ? recentActivities : []
          }
          upcomingSchedules={
            Array.isArray(upcomingSchedules) ? upcomingSchedules : []
          }
          onShowAdvice={handleShowAdvice}
          onShowWeatherDetail={handleShowWeatherDetail}
          onScrollToWeatherSection={handleScrollToWeatherSection}
          onShowAlertDetails={handleShowAlertDetails}
          adviceLoading={gardenAdviceLoading || {}}
          weatherDetailLoading={weatherDetailLoading || {}}
          getSensorStatus={getSensorStatus}
        />
      </ScrollView>

      {/* Modals */}
      <AdviceModal
        isVisible={adviceModalVisible}
        onClose={() => setAdviceModalVisible(false)}
        advice={
          selectedGardenForAdvice !== null &&
          gardenAdviceByGarden &&
          typeof gardenAdviceByGarden === "object" &&
          selectedGardenForAdvice in gardenAdviceByGarden
            ? gardenAdviceByGarden[selectedGardenForAdvice]
            : []
        }
        adviceType="garden"
        isLoading={
          selectedGardenForAdvice !== null &&
          gardenAdviceLoading &&
          typeof gardenAdviceLoading === "object" &&
          selectedGardenForAdvice in gardenAdviceLoading
            ? gardenAdviceLoading[selectedGardenForAdvice]
            : false
        }
        error={
          selectedGardenForAdvice !== null &&
          gardenAdviceError &&
          typeof gardenAdviceError === "object" &&
          selectedGardenForAdvice in gardenAdviceError
            ? gardenAdviceError[selectedGardenForAdvice]
            : null
        }
        gardenName={selectedGardenName}
        theme={theme}
      />

      <WeatherDetailModal
        isVisible={weatherDetailVisible}
        onClose={() => setWeatherDetailVisible(false)}
        currentWeather={
          selectedGardenForWeather !== null &&
          gardenWeatherData &&
          typeof gardenWeatherData === "object" &&
          selectedGardenForWeather in gardenWeatherData
            ? gardenWeatherData[selectedGardenForWeather].current
            : null
        }
        hourlyForecast={
          selectedGardenForWeather !== null &&
          gardenWeatherData &&
          typeof gardenWeatherData === "object" &&
          selectedGardenForWeather in gardenWeatherData &&
          Array.isArray(gardenWeatherData[selectedGardenForWeather].hourly)
            ? gardenWeatherData[selectedGardenForWeather].hourly
            : []
        }
        dailyForecast={
          selectedGardenForWeather !== null &&
          gardenWeatherData &&
          typeof gardenWeatherData === "object" &&
          selectedGardenForWeather in gardenWeatherData &&
          Array.isArray(gardenWeatherData[selectedGardenForWeather].daily)
            ? gardenWeatherData[selectedGardenForWeather].daily
            : []
        }
        weatherAdvice={
          selectedGardenForWeather !== null &&
          weatherAdviceByGarden &&
          typeof weatherAdviceByGarden === "object" &&
          selectedGardenForWeather in weatherAdviceByGarden &&
          Array.isArray(weatherAdviceByGarden[selectedGardenForWeather])
            ? weatherAdviceByGarden[selectedGardenForWeather]
            : []
        }
        adviceType="weather"
        optimalTimes={
          selectedGardenForWeather !== null &&
          optimalGardenTimes &&
          typeof optimalGardenTimes === "object" &&
          selectedGardenForWeather in optimalGardenTimes &&
          optimalGardenTimes[selectedGardenForWeather]?.WATERING &&
          Array.isArray(optimalGardenTimes[selectedGardenForWeather].WATERING)
            ? optimalGardenTimes[selectedGardenForWeather].WATERING
            : []
        }
        garden={selectedGardenForModal as any as GardenDisplayDto | undefined}
        isLoading={
          selectedGardenForWeather !== null &&
          weatherDetailLoading &&
          typeof weatherDetailLoading === "object" &&
          selectedGardenForWeather in weatherDetailLoading
            ? weatherDetailLoading[selectedGardenForWeather]
            : false
        }
        theme={theme}
      />

      <AlertDetailsModal
        isVisible={alertDetailVisible}
        onClose={() => setAlertDetailVisible(false)}
        alerts={
          selectedGardenForAlerts !== null &&
          gardenAlerts &&
          typeof gardenAlerts === "object" &&
          selectedGardenForAlerts in gardenAlerts &&
          Array.isArray(gardenAlerts[selectedGardenForAlerts])
            ? gardenAlerts[selectedGardenForAlerts]
            : []
        }
        gardenName={
          selectedGardenForAlerts !== null
            ? (gardens as any as GardenDisplayDto[]).find(
                (g) => g.id === selectedGardenForAlerts
              )?.name || ""
            : ""
        }
        sensorData={
          selectedGardenForAlerts !== null &&
          gardenSensorData &&
          typeof gardenSensorData === "object" &&
          selectedGardenForAlerts in gardenSensorData
            ? gardenSensorData[selectedGardenForAlerts]
            : {}
        }
        theme={theme}
      />
    </SafeAreaView>
  );
}

// Make styles function
const makeStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 20,
    },
  });

// Wrapper component with Garden Provider
function HomeScreen() {
  return (
    <GardenProvider>
      <HomeScreenContent />
    </GardenProvider>
  );
}

export default HomeScreen;
