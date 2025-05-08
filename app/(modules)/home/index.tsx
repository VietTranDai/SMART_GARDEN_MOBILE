import React, {
  useMemo,
  useRef,
  useCallback,
  useEffect,
  useState,
  memo,
} from "react";
import {
  FlatList,
  RefreshControl,
  Animated,
  Text,
  View,
  Platform,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  FlexAlignType,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// Import custom hooks
import useHomeData, { getSensorStatus } from "@/hooks/useHomeData";
import { useGardenContext } from "@/context/GardenContext";

// Import styles
import { makeHomeStyles } from "@/components/common/styles";

// Import UI components
import GardenDisplay from "@/components/common/GardenDisplay";
import SensorDisplay from "@/components/common/SensorDisplay";
import WeatherDisplay from "@/components/common/WeatherDisplay";
import AlertCenter from "@/components/home/AlertCenter";
import ActivityTimeline from "@/components/home/ActivityTimeline";
import LoadingView from "@/components/common/LoadingView";
import ErrorView from "@/components/common/ErrorView";
import EmptyGardensView from "@/components/common/EmptyGardensView";
import AdviceModal from "@/components/common/AdviceModal";
import WeatherDetailModal from "@/components/common/WeatherDetailModal";
import AlertDetailsModal from "@/components/common/AlertDetailsModal";
import { GardenProvider } from "@/context/GardenContext";
import { SensorType } from "@/types/gardens/sensor.types";

// Define Section Types for the layout
enum SectionType {
  GARDENS = "GARDENS",
  WEATHER = "WEATHER",
  ALERTS = "ALERTS",
  ACTIVITY = "ACTIVITY",
}

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

// Thêm interfaces cho props của các memo components
interface GardenSectionProps {
  gardens: any[];
  onTogglePinGarden: (gardenId: number) => void;
  onShowAdvice: (gardenId: number) => void;
  onShowWeatherDetail: (gardenId: number) => void;
  onScrollToWeatherSection: (gardenId: number) => void;
  onShowAlertDetails: (gardenId: number) => void;
  sensorDataByGarden: Record<number, Record<string, any[]>>;
  sensorDataLoading: Record<number, boolean>;
  sensorDataError: Record<number, string | null>;
  weatherDataByGarden: Record<number, any>;
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
  currentWeather: any | null;
  selectedGarden: any | undefined;
  hourlyForecast: any[];
  dailyForecast: any[];
  getWeatherTip: any;
  showFullDetails: boolean;
  onShowWeatherDetail: () => void;
  animationValue: Animated.Value;
  theme: any;
  gardenWeatherData?: Record<number, any>;
}

interface AlertSectionProps {
  selectedGardenId: number | null;
  gardenAlerts: Record<number, any[]>;
  animationValue: Animated.Value;
  theme: any;
}

interface ActivitySectionProps {
  recentActivities: any[];
  upcomingSchedules: any[];
  selectedGardenId: number | null;
  animationValue: Animated.Value;
  theme: any;
}

// Define the props for DynamicSections
interface DynamicSectionsProps {
  sections: Section[];
  weatherData: any | null;
  selectedGardenId: number | null;
  sectionAnimations: {
    gardens: Animated.Value;
    weather: Animated.Value;
    alerts: Animated.Value;
    activity: Animated.Value;
  };
  gardenAlerts: Record<number, any[]>;
  recentActivities: any[];
  upcomingSchedules: any[];
  gardenWeatherData: Record<number, any>;
  theme: any;
  handleShowWeatherDetail: (gardenId: number | null) => void;
  getWeatherTip: (weather: any) => string;
  gardens: any[];
}

// Sửa đổi các component memos để sử dụng interfaces
const GardenSection = memo((props: GardenSectionProps) => {
  const {
    gardens,
    onTogglePinGarden,
    onShowAdvice,
    onShowWeatherDetail,
    onScrollToWeatherSection,
    onShowAlertDetails,
    sensorDataByGarden,
    sensorDataLoading,
    sensorDataError,
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

  return (
    <Animated.View style={[styles.section, animatedStyle]}>
      <GardenDisplay
        gardens={gardens}
        onTogglePinGarden={onTogglePinGarden}
        onShowAdvice={onShowAdvice}
        onShowWeatherDetail={onShowWeatherDetail}
        onScrollToWeatherSection={onScrollToWeatherSection}
        onShowAlertDetails={onShowAlertDetails}
        sensorDataByGarden={sensorDataByGarden}
        sensorDataLoading={sensorDataLoading}
        sensorDataError={sensorDataError}
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
    gardenWeatherData,
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

  // Get weather data for selected garden
  const weatherData = useMemo(() => {
    if (selectedGarden?.id && gardenWeatherData?.[selectedGarden.id]) {
      return gardenWeatherData[selectedGarden.id].current;
    }
    return currentWeather;
  }, [selectedGarden, gardenWeatherData, currentWeather]);

  // Get forecast data for selected garden
  const forecastData = useMemo(() => {
    if (selectedGarden?.id && gardenWeatherData?.[selectedGarden.id]) {
      return {
        hourly: gardenWeatherData[selectedGarden.id].hourly || [],
        daily: gardenWeatherData[selectedGarden.id].daily || [],
      };
    }
    return { hourly: hourlyForecast || [], daily: dailyForecast || [] };
  }, [selectedGarden, gardenWeatherData, hourlyForecast, dailyForecast]);

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
        currentWeather={weatherData}
        selectedGarden={selectedGarden}
        hourlyForecast={forecastData.hourly}
        dailyForecast={forecastData.daily}
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

  return (
    <Animated.View style={[styles.section, animatedStyle]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Thông báo
        </Text>
      </View>
      <AlertCenter selectedGardenId={selectedGardenId} alerts={gardenAlerts} />
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

  return (
    <Animated.View style={[styles.section, animatedStyle]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Hoạt động
        </Text>
      </View>
      <ActivityTimeline
        recentActivities={recentActivities}
        upcomingSchedules={upcomingSchedules}
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
  const selectedGarden = useMemo(
    () => gardens.find((g) => g.id === selectedGardenId),
    [gardens, selectedGardenId]
  );

  // Tối ưu: Tách logic lấy weather data ra khỏi render
  const currentWeatherData = useMemo(() => {
    if (selectedGardenId && gardenWeatherData[selectedGardenId]) {
      return gardenWeatherData[selectedGardenId].current;
    }
    return weatherData;
  }, [selectedGardenId, gardenWeatherData, weatherData]);

  // Tối ưu: Tách logic lấy forecast data ra khỏi render
  const forecastData = useMemo(() => {
    if (selectedGardenId && gardenWeatherData[selectedGardenId]) {
      return {
        hourly: gardenWeatherData[selectedGardenId].hourly || [],
        daily: gardenWeatherData[selectedGardenId].daily || [],
      };
    }
    return { hourly: [], daily: [] };
  }, [selectedGardenId, gardenWeatherData]);

  // Tối ưu: Tách logic render từng section ra các components riêng
  const renderWeatherSection = useCallback(() => {
    const isSelectedGarden = !!selectedGardenId;

    return (
      <WeatherSection
        currentWeather={currentWeatherData}
        selectedGarden={selectedGarden}
        hourlyForecast={forecastData.hourly}
        dailyForecast={forecastData.daily}
        getWeatherTip={getWeatherTip}
        showFullDetails={isSelectedGarden}
        onShowWeatherDetail={() => handleShowWeatherDetail(selectedGardenId)}
        animationValue={sectionAnimations.weather}
        theme={theme}
        gardenWeatherData={gardenWeatherData}
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
    gardenWeatherData,
  ]);

  const renderAlertSection = useCallback(() => {
    return (
      <AlertSection
        selectedGardenId={selectedGardenId}
        gardenAlerts={gardenAlerts}
        animationValue={sectionAnimations.alerts}
        theme={theme}
      />
    );
  }, [selectedGardenId, gardenAlerts, sectionAnimations.alerts, theme]);

  const renderActivitySection = useCallback(() => {
    return (
      <ActivitySection
        recentActivities={recentActivities}
        upcomingSchedules={upcomingSchedules}
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
        case SectionType.ALERTS:
          return renderAlertSection();
        case SectionType.ACTIVITY:
          return renderActivitySection();
        default:
          return null;
      }
    },
    [renderWeatherSection, renderAlertSection, renderActivitySection]
  );

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
});

// Tạo một wrapper component cho HomeScreen
const HomeScreenWrapper = () => {
  return (
    <GardenProvider>
      <HomeScreenContent />
    </GardenProvider>
  );
};

// Rename HomeScreen thành HomeScreenContent và giữ lại logic
function HomeScreenContent() {
  const theme = useAppTheme();
  const styles = useMemo(() => makeHomeStyles(theme), [theme]);

  // Use ScrollView ref instead of FlatList
  const scrollViewRef = useRef<ScrollView>(null);

  // Tracking refs
  const hasInitialFetch = useRef(false);
  const lastFetchTime = useRef(Date.now());

  // Use context for garden selection
  const { selectedGardenId, selectGarden } = useGardenContext();

  // Get all data from our custom hook
  const {
    user,
    loading,
    error,
    refreshing,
    gardens,
    weatherData,
    sensorDataByType,
    gardenAlerts,
    getWeatherTip,
    getSensorIconName,
    handleTogglePinGarden,
    recentActivities,
    upcomingSchedules,
    refresh,
    sensorDataLoading,
    sensorDataError,
    gardenSensorData,
    gardenAdvice,
    fetchGardenAdvice,
    adviceLoading,
    adviceError,
    gardenWeatherData,
    weatherAdviceByGarden,
    optimalGardenTimes,
    weatherDetailLoading,
    weatherDetailError,
    fetchWeatherAdvice,
    calculateOptimalTimes,
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
    alerts: useRef(new Animated.Value(0)).current,
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
        Animated.timing(sectionAnimations.alerts, {
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
    await refresh();

    // Reset animations after refresh
    Object.values(sectionAnimations).forEach((anim) => anim.setValue(0));

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
        Animated.timing(sectionAnimations.alerts, {
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
  }, [refresh, animateRefresh, sectionAnimations]);

  // Initial fetch when component mounts
  useEffect(() => {
    if (!hasInitialFetch.current && !loading && !refreshing) {
      // Avoid calling API too frequently
      const now = Date.now();
      if (now - lastFetchTime.current < 10000) {
        // 10s debounce
        return;
      }

      console.log("Performing initial fetch");
      lastFetchTime.current = now;
      hasInitialFetch.current = true;
      refresh();
    }
  }, [refresh, loading, refreshing]);

  // Auto-fetch weather data when selecting a new garden
  useEffect(() => {
    if (selectedGardenId) {
      const fetchWeatherForGarden = async () => {
        try {
          // Always fetch fresh weather data when garden is selected
          await fetchWeatherAdvice(selectedGardenId);
          await calculateOptimalTimes(selectedGardenId, "WATERING");
        } catch (error) {
          console.error("Error fetching weather data:", error);
        }
      };
      fetchWeatherForGarden();
    }
  }, [selectedGardenId, fetchWeatherAdvice, calculateOptimalTimes]);

  // Handle showing advice modal
  const handleShowAdvice = useCallback(
    async (gardenId: number) => {
      setSelectedGardenForAdvice(gardenId);

      // Fetch advice data if needed
      if (!gardenAdvice[gardenId] && !adviceLoading[gardenId]) {
        await fetchGardenAdvice(gardenId);
      }

      setAdviceModalVisible(true);
    },
    [gardenAdvice, adviceLoading, fetchGardenAdvice]
  );

  // Handle showing weather detail modal
  const handleShowWeatherDetail = useCallback(
    async (gardenId: number | null = null) => {
      // Use current selectedGardenId if none provided
      const targetGardenId = gardenId !== null ? gardenId : selectedGardenId;
      setSelectedGardenForWeather(targetGardenId);

      // Fetch weather advice if needed
      if (
        targetGardenId !== null &&
        !weatherAdviceByGarden[targetGardenId] &&
        !weatherDetailLoading[targetGardenId]
      ) {
        fetchWeatherAdvice(targetGardenId);
      }

      // Calculate optimal times for common activities if needed
      if (
        targetGardenId !== null &&
        !optimalGardenTimes[targetGardenId]?.WATERING &&
        !weatherDetailLoading[targetGardenId]
      ) {
        calculateOptimalTimes(targetGardenId, "WATERING");
      }

      setWeatherDetailVisible(true);
    },
    [
      selectedGardenId,
      gardenWeatherData,
      weatherAdviceByGarden,
      weatherDetailLoading,
      fetchWeatherAdvice,
      calculateOptimalTimes,
      optimalGardenTimes,
    ]
  );

  // Handle showing alert details modal
  const handleShowAlertDetails = useCallback((gardenId: number) => {
    setSelectedGardenForAlerts(gardenId);
    setAlertDetailVisible(true);
  }, []);

  // Scroll to weather section function
  const handleScrollToWeatherSection = useCallback(
    (gardenId: number) => {
      // Select garden to display its weather
      selectGarden(gardenId);

      // Use timeout to ensure garden selection is processed and UI is updated
      setTimeout(() => {
        // Simply scroll down to where weather section would be - approximate position
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            y: 300, // Approximate position where weather section would be
            animated: true,
          });
        }
      }, 100);
    },
    [selectGarden]
  );

  // Define sections to render
  const sections = useMemo(() => {
    const constructedSections: Section[] = [
      { type: SectionType.GARDENS, key: "gardens" },
    ];

    // Add weather section if we have weather data or garden weather data
    if (
      weatherData ||
      (selectedGardenId && gardenWeatherData[selectedGardenId])
    ) {
      constructedSections.push({ type: SectionType.WEATHER, key: "weather" });
    }

    // Add alerts section if there are alerts
    if (selectedGardenId && Object.values(gardenAlerts).flat().length > 0) {
      constructedSections.push({ type: SectionType.ALERTS, key: "alerts" });
    }

    // Add activity timeline section if there are activities or schedules
    if (
      selectedGardenId &&
      (recentActivities.length > 0 || upcomingSchedules.length > 0)
    ) {
      constructedSections.push({ type: SectionType.ACTIVITY, key: "activity" });
    }

    return constructedSections;
  }, [
    weatherData,
    selectedGardenId,
    gardenWeatherData,
    gardenAlerts,
    recentActivities,
    upcomingSchedules,
  ]);

  // Key extractor for sections
  const keyExtractor = useCallback((item: Section) => item.key, []);

  // Get current selected garden name for advice modal
  const selectedGardenName = useMemo(() => {
    if (!selectedGardenForAdvice) return "";
    const garden = gardens.find((g) => g.id === selectedGardenForAdvice);
    return garden ? garden.name : "";
  }, [selectedGardenForAdvice, gardens]);

  // Get garden name for weather detail modal
  const selectedGardenNameForWeather = useMemo(() => {
    if (!selectedGardenForWeather) return "";
    const garden = gardens.find((g) => g.id === selectedGardenForWeather);
    return garden ? garden.name : "";
  }, [selectedGardenForWeather, gardens]);

  // Render Garden Section with reduced props
  const renderGardenSection = useMemo(() => {
    return (
      <GardenSection
        gardens={gardens}
        onTogglePinGarden={handleTogglePinGarden}
        onShowAdvice={handleShowAdvice}
        onShowWeatherDetail={handleShowWeatherDetail}
        onScrollToWeatherSection={handleScrollToWeatherSection}
        onShowAlertDetails={handleShowAlertDetails}
        sensorDataByGarden={gardenSensorData}
        sensorDataLoading={sensorDataLoading}
        sensorDataError={sensorDataError}
        weatherDataByGarden={gardenWeatherData}
        adviceLoading={adviceLoading}
        weatherDetailLoading={weatherDetailLoading}
        animationValue={sectionAnimations.gardens}
        theme={theme}
        getSensorStatus={getSensorStatus}
        showLargeCards={gardens.length <= 2}
        onSelectGarden={(gardenId) => selectGarden(gardenId)}
      />
    );
  }, [
    gardens,
    handleTogglePinGarden,
    handleShowAdvice,
    handleShowWeatherDetail,
    handleScrollToWeatherSection,
    handleShowAlertDetails,
    gardenSensorData,
    sensorDataLoading,
    sensorDataError,
    gardenWeatherData,
    adviceLoading,
    weatherDetailLoading,
    sectionAnimations.gardens,
    theme,
    getSensorStatus,
    selectGarden,
  ]);

  // Render key for Dynamic Sections
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    // Only trigger re-renders for Dynamic Sections when selectedGardenId changes
    setRenderKey((prevKey) => prevKey + 1);
  }, [selectedGardenId]);

  // If loading, show loading indicator
  if (loading && !refreshing) {
    return <LoadingView message="Đang tải dữ liệu..." />;
  }

  // If there's an error, show error view
  if (error) {
    return <ErrorView message={error} onRetry={refresh} />;
  }

  // If there are no gardens and we're not loading, show empty gardens view
  if (gardens.length === 0 && !loading) {
    return <EmptyGardensView />;
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      {loading && !refreshing ? (
        <LoadingView message="Đang tải dữ liệu..." />
      ) : error ? (
        <ErrorView message={error} onRetry={refresh} />
      ) : gardens.length === 0 ? (
        <EmptyGardensView />
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 }}
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
          {/* Garden Section */}
          {renderGardenSection}

          {/* Weather Section */}
          {(weatherData ||
            (selectedGardenId && gardenWeatherData[selectedGardenId])) && (
            <Animated.View
              style={[
                styles.section,
                {
                  opacity: sectionAnimations.weather,
                  transform: [
                    {
                      translateY: sectionAnimations.weather.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  {selectedGardenId
                    ? `Thời tiết - ${
                        gardens.find((g) => g.id === selectedGardenId)?.name ||
                        ""
                      }`
                    : "Thời tiết"}
                </Text>
                {selectedGardenId && (
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 4,
                      paddingHorizontal: 8,
                    }}
                    onPress={() => handleShowWeatherDetail(selectedGardenId)}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter-Medium",
                        marginRight: 4,
                        color: theme.primary,
                      }}
                    >
                      Chi tiết
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={theme.primary}
                    />
                  </TouchableOpacity>
                )}
              </View>
              <WeatherDisplay
                currentWeather={
                  selectedGardenId && gardenWeatherData[selectedGardenId]
                    ? gardenWeatherData[selectedGardenId].current
                    : weatherData
                }
                selectedGarden={
                  selectedGardenId
                    ? gardens.find((g) => g.id === selectedGardenId)
                    : undefined
                }
                hourlyForecast={
                  selectedGardenId && gardenWeatherData[selectedGardenId]
                    ? gardenWeatherData[selectedGardenId].hourly || []
                    : []
                }
                dailyForecast={
                  selectedGardenId && gardenWeatherData[selectedGardenId]
                    ? gardenWeatherData[selectedGardenId].daily || []
                    : []
                }
                getWeatherTip={getWeatherTip}
                showFullDetails={!!selectedGardenId}
                onShowDetail={() => handleShowWeatherDetail(selectedGardenId)}
              />
            </Animated.View>
          )}

          {/* Alert Section */}
          {selectedGardenId &&
            Object.values(gardenAlerts).flat().length > 0 && (
              <AlertSection
                selectedGardenId={selectedGardenId}
                gardenAlerts={gardenAlerts}
                animationValue={sectionAnimations.alerts}
                theme={theme}
              />
            )}

          {/* Activity Section */}
          {selectedGardenId &&
            (recentActivities.length > 0 || upcomingSchedules.length > 0) && (
              <ActivitySection
                recentActivities={recentActivities}
                upcomingSchedules={upcomingSchedules}
                selectedGardenId={selectedGardenId}
                animationValue={sectionAnimations.activity}
                theme={theme}
              />
            )}
        </ScrollView>
      )}

      {/* Advice Modal */}
      <AdviceModal
        isVisible={adviceModalVisible}
        onClose={() => setAdviceModalVisible(false)}
        advice={
          selectedGardenForAdvice !== null
            ? gardenAdvice[selectedGardenForAdvice] || []
            : []
        }
        isLoading={
          selectedGardenForAdvice !== null
            ? adviceLoading[selectedGardenForAdvice] || false
            : false
        }
        error={
          selectedGardenForAdvice !== null
            ? adviceError[selectedGardenForAdvice] || null
            : null
        }
        gardenName={selectedGardenName}
        theme={theme}
      />

      {/* Weather Detail Modal */}
      <WeatherDetailModal
        isVisible={weatherDetailVisible}
        onClose={() => setWeatherDetailVisible(false)}
        currentWeather={
          selectedGardenForWeather !== null &&
          gardenWeatherData[selectedGardenForWeather]
            ? gardenWeatherData[selectedGardenForWeather].current
            : null
        }
        hourlyForecast={
          selectedGardenForWeather !== null &&
          gardenWeatherData[selectedGardenForWeather]
            ? gardenWeatherData[selectedGardenForWeather].hourly
            : []
        }
        dailyForecast={
          selectedGardenForWeather !== null &&
          gardenWeatherData[selectedGardenForWeather]
            ? gardenWeatherData[selectedGardenForWeather].daily
            : []
        }
        weatherAdvice={
          selectedGardenForWeather !== null
            ? weatherAdviceByGarden[selectedGardenForWeather] || []
            : []
        }
        optimalTimes={
          selectedGardenForWeather !== null
            ? optimalGardenTimes[selectedGardenForWeather]?.WATERING || []
            : []
        }
        garden={
          selectedGardenForWeather !== null
            ? gardens.find((g) => g.id === selectedGardenForWeather) ||
              undefined
            : undefined
        }
        isLoading={
          selectedGardenForWeather !== null
            ? weatherDetailLoading[selectedGardenForWeather] || false
            : false
        }
        theme={theme}
      />

      {/* Alert Details Modal */}
      <AlertDetailsModal
        isVisible={alertDetailVisible}
        onClose={() => setAlertDetailVisible(false)}
        alerts={
          selectedGardenForAlerts !== null
            ? (gardenAlerts[selectedGardenForAlerts] || [])
                .filter((alert) => alert.gardenId)
                .map((alert) => ({
                  ...alert,
                  severity: alert.severity || "LOW",
                  title: alert.message,
                  timestamp: alert.createdAt,
                }))
            : []
        }
        gardenName={
          selectedGardenForAlerts !== null &&
          gardens.find((g) => g.id === selectedGardenForAlerts)
            ? gardens.find((g) => g.id === selectedGardenForAlerts)?.name || ""
            : ""
        }
        sensorData={
          selectedGardenForAlerts !== null
            ? gardenSensorData[selectedGardenForAlerts] || {}
            : {}
        }
        theme={theme}
      />
    </SafeAreaView>
  );
}

// Export HomeScreenWrapper thay vì HomeScreen
export default HomeScreenWrapper;
