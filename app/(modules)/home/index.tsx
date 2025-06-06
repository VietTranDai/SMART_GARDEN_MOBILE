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
import { NavigationProp, useNavigation } from "@react-navigation/native";

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
import GardenCalendarDetailModal from "@/components/garden/GardenCalendarDetailModal";
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
  onNavigateToDetail: (gardenId: number) => void;
}

// Update interface name and props for calendar section
interface CalendarSectionProps {
  gardenId: number | null;
  selectedGarden: GardenDisplayDto | undefined;
  animationValue: Animated.Value;
  theme: any;
  onShowDetail: (gardenId: number) => void;
}

interface AlertSectionProps {
  selectedGardenId: number | null;
  gardenAlerts: Record<number, Alert[]>;
  animationValue: Animated.Value;
  theme: any;
}

// Define the props for DynamicSections - Update to use calendar
interface DynamicSectionsProps {
  sections: Section[];
  weatherData: WeatherObservation | null;
  selectedGardenId: number | null;
  sectionAnimations: {
    gardens: Animated.Value;
    calendar: Animated.Value; // Change from weather to calendar
    activity: Animated.Value;
  };
  gardenAlerts: Record<number, Alert[]>;
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
    onNavigateToDetail,
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
      return {};
    }

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
        onNavigateToDetail={onNavigateToDetail}
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

const CalendarSection = memo((props: CalendarSectionProps) => {
  const {
    gardenId,
    selectedGarden,
    animationValue,
    theme,
    onShowDetail,
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

  return (
    <Animated.View style={[styles.section, animatedStyle]}>
      {/* Calendar content will be handled by CalendarSection component */}
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          Lịch trình vườn sẽ hiển thị ở đây
        </Text>
      </View>
    </Animated.View>
  );
});

// Update DynamicSections to use the defined props
const DynamicSections = memo((props: DynamicSectionsProps) => {
  const {
    sections,
    selectedGardenId,
    sectionAnimations,
    gardenAlerts,
    gardens,
    theme,
    handleShowWeatherDetail,
  } = props;

  const styles = useMemo(() => extendedHomeStyles(theme), [theme]);

  // Find selected garden
  const selectedGarden = useMemo(() => {
    if (!selectedGardenId || !Array.isArray(gardens)) return undefined;
    return gardens.find((garden) => garden.id === selectedGardenId);
  }, [selectedGardenId, gardens]);

  const renderCalendarSection = useCallback(() => {
    return (
      <CalendarSection
        gardenId={selectedGardenId}
        selectedGarden={selectedGarden}
        animationValue={sectionAnimations.calendar} // Use calendar animation
        theme={theme}
        onShowDetail={(gardenId: number) => handleShowWeatherDetail(gardenId)}
      />
    );
  }, [selectedGardenId, selectedGarden, sectionAnimations.calendar, theme, handleShowWeatherDetail]);

  const renderSection = useCallback(
    ({ item, index }: { item: Section; index: number }) => {
      switch (item.type) {
        case SectionType.CALENDAR: // Change from WEATHER to CALENDAR
          return renderCalendarSection();
        default:
          return null;
      }
    },
    [renderCalendarSection]
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

// Define your RootStackParamList, ideally in a dedicated types file
export type RootStackParamList = {
  Home: undefined; // Or specific params for Home if any
  GardenDetailScreen: { gardenId: number }; // Ensure 'GardenDetailScreen' is your actual route name
  // ... other routes in your app
};

// Rename HomeScreen thành HomeScreenContent và giữ lại logic
function HomeScreenContent() {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

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
  const [calendarDetailVisible, setCalendarDetailVisible] = useState(false);
  const [selectedGardenForCalendar, setSelectedGardenForCalendar] = useState<
    number | null
  >(null);

  // State for garden-specific advice data, loading, and error
  const [gardenAdviceByGarden, setGardenAdviceByGarden] = useState<
    Record<number, GardenAdvice[]>
  >({});
  const [gardenAdviceLoading, setGardenAdviceLoading] = useState<
    Record<number, boolean>
  >({});
  const [gardenAdviceError, setGardenAdviceError] = useState<
    Record<number, string | null>
  >({});

  // Animation ref for refresh control
  const refreshAnimationRef = useRef(new Animated.Value(0));

  // Section animations - Update to use calendar instead of weather
  const sectionAnimations = {
    gardens: useRef(new Animated.Value(0)).current,
    calendar: useRef(new Animated.Value(0)).current, // Change from weather to calendar
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
        Animated.timing(sectionAnimations.calendar, { // Change from weather to calendar
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
        Animated.timing(sectionAnimations.calendar, { // Change from weather to calendar
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
      setAdviceModalVisible(true); // Hiển thị modal ngay lập tức

      // Kiểm tra xem advice cho garden này đã được fetch trước đó (kể cả khi kết quả là [])
      // hoặc có đang trong quá trình tải không.
      if (
        gardenAdviceByGarden.hasOwnProperty(gardenId) ||
        gardenAdviceLoading[gardenId]
      ) {
        return;
      }

      // Tiến hành fetch dữ liệu
      setGardenAdviceLoading((prev) => ({
        ...prev,
        [gardenId]: true,
      }));
      setGardenAdviceError((prev) => ({
        // Xóa lỗi trước đó cho garden này
        ...prev,
        [gardenId]: null,
      }));

      try {
        // fetchGardenAdvice từ useHomeData được kỳ vọng trả về GardenAdvice[]
        // và tự xử lý lỗi bằng cách trả về [] nếu gardenService.getGardenAdvice thất bại.
        const adviceData = await fetchGardenAdvice(gardenId);

        // Lưu trữ advice trong state
        setGardenAdviceByGarden((prev) => ({
          ...prev,
          [gardenId]: adviceData,
        }));
      } catch (error) {
        // Khối catch này chủ yếu xử lý lỗi nếu bản thân fetchGardenAdvice (từ useHomeData) throw lỗi,
        // thường không phải là lỗi từ lệnh gọi service bên dưới nếu useHomeData.fetchGardenAdvice
        // đã bắt và xử lý chúng bằng cách trả về [].
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(
          `Error in handleShowAdvice while fetching garden advice for garden ${gardenId}:`,
          errorMessage
        );
        setGardenAdviceError((prev) => ({
          ...prev,
          [gardenId]: `Không thể tải lời khuyên cho vườn này. Vui lòng thử lại.`,
        }));
        // Tùy chọn: đảm bảo advice cho garden này là một mảng rỗng khi có lỗi
        // setGardenAdviceByGarden((prev) => ({ ...prev, [gardenId]: [] }));
      } finally {
        // Xóa trạng thái loading
        setGardenAdviceLoading((prev) => ({
          ...prev,
          [gardenId]: false,
        }));
      }
    },
    [fetchGardenAdvice, gardenAdviceByGarden, gardenAdviceLoading] // Cập nhật dependencies
  );

  // Handle navigation to Garden Detail screen
  const handleNavigateToGardenDetail = useCallback(
    (gardenId: number) => {
      navigation.navigate("GardenDetailScreen", { gardenId });
    },
    [navigation]
  );

  // Handle showing calendar detail modal (replace weather detail functionality)
  const handleShowCalendarDetail = useCallback(
    async (gardenId: number) => {
      // Kiểm tra gardenId có hợp lệ không
      if (gardenId === null || gardenId === undefined || isNaN(gardenId)) {
        console.log("Invalid garden ID, skipping calendar detail");
        return;
      }

      setSelectedGardenForCalendar(gardenId);
      setCalendarDetailVisible(true);
    },
    []
  );

  // Handle showing weather detail modal (keeping for compatibility)
  const handleShowWeatherDetail = useCallback(
    async (gardenId: number) => {
      // For now, redirect to calendar detail instead of weather detail
      handleShowCalendarDetail(gardenId);
    },
    [handleShowCalendarDetail]
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

  // Scroll to calendar section (updated from weather section)
  const handleScrollToCalendarSection = useCallback(
    (gardenId: number) => {
      // Kiểm tra gardenId có hợp lệ không
      if (gardenId === null || gardenId === undefined || isNaN(gardenId)) {
        console.log("Invalid garden ID, skipping scroll to calendar");
        return;
      }

      // Select garden to display its calendar
      selectGarden(gardenId);

      // Use timeout to ensure garden selection is processed
      setTimeout(() => {
        // Scroll down to where calendar section would be
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            y: 300, // Approximate position of calendar section
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

    // Luôn hiển thị phần lịch trình khi có một vườn được chọn hợp lệ
    if (hasValidGardenSelected) {
      visibleSections.push({ type: SectionType.CALENDAR, visible: true }); // Change from WEATHER to CALENDAR
    }

    return visibleSections;
  }, [selectedGardenId, gardens]);

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

  const selectedGardenForCalendarModal = useMemo(() => {
    if (!selectedGardenForCalendar || !Array.isArray(gardens)) return undefined;
    return gardens.find((g) => g.id === selectedGardenForCalendar);
  }, [selectedGardenForCalendar, gardens]);

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
    <View style={styles.container}>
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
          onShowAdvice={handleShowAdvice}
          onShowWeatherDetail={handleShowWeatherDetail}
          onScrollToWeatherSection={handleScrollToCalendarSection}
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

      <GardenCalendarDetailModal
        visible={calendarDetailVisible}
        onClose={() => setCalendarDetailVisible(false)}
        gardenId={selectedGardenForCalendar}
        selectedGarden={selectedGardenForCalendarModal as GardenDisplayDto | undefined}
      />
    </View>
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
