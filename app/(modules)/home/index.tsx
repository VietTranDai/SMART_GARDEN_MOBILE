import React, { useMemo, useRef, useCallback, useEffect } from "react";
import {
  FlatList,
  RefreshControl,
  Animated,
  Text,
  View,
  Platform,
  StyleProp,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/useAppTheme";

// Import custom hooks
import useHomeData from "@/hooks/useHomeData";

// Import UI components
import HeaderBar from "@/components/home/HeaderBar";
import GardenDisplay from "@/components/common/GardenDisplay";
import SensorDisplay from "@/components/common/SensorDisplay";
import WeatherDisplay from "@/components/common/WeatherDisplay";
import AlertCenter from "@/components/home/AlertCenter";
import ActivityTimeline from "@/components/home/ActivityTimeline";
import QuickActions from "@/components/common/QuickActions";
import LoadingView from "@/components/common/LoadingView";
import ErrorView from "@/components/common/ErrorView";
import EmptyGardensView from "@/components/common/EmptyGardensView";

// Import styles
import { makeHomeStyles } from "@/components/common/styles";

// Define Section Types for the layout
enum SectionType {
  HEADER = "HEADER",
  GARDENS = "GARDENS",
  SENSORS = "SENSORS",
  WEATHER = "WEATHER",
  ALERTS = "ALERTS",
  ACTIVITY = "ACTIVITY",
  QUICK_ACTIONS = "QUICK_ACTIONS",
}

// Structure for the main FlatList data
interface Section {
  type: SectionType;
  key: string;
}

export default function HomeScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => makeHomeStyles(theme), [theme]);

  // Thêm ref để theo dõi việc đã thực hiện initial fetch chưa
  const hasInitialFetch = useRef(false);
  // Thêm ref để theo dõi thời gian fetch gần nhất
  const lastFetchTime = useRef(Date.now());

  // Get all data from our custom hook
  const {
    user,
    loading,
    error,
    refreshing,
    gardens,
    selectedGardenId,
    weatherData,
    sensorDataByType,
    gardenAlerts,
    getWeatherTip,
    getSensorStatus,
    getSensorIconName,
    handleSelectGarden,
    handleTogglePinGarden,
    recentActivities,
    upcomingSchedules,
    refresh,
  } = useHomeData();

  // Animation ref for refresh control
  const refreshAnimationRef = useRef(new Animated.Value(0));

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
    // Ngăn chặn gọi refresh quá thường xuyên
    const now = Date.now();
    if (now - lastFetchTime.current < 10000) {
      // 10s debounce
      console.log("Debouncing refresh - too frequent");
      return;
    }

    lastFetchTime.current = now;
    animateRefresh();
    await refresh();
  }, [refresh, animateRefresh]);

  // Thực hiện fetch ban đầu khi component được mount
  useEffect(() => {
    if (!hasInitialFetch.current && !loading && !refreshing) {
      // Tránh gọi API quá thường xuyên
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

  // Define the sections to render - ensure this is always called
  const sections = useMemo(() => {
    const constructedSections: Section[] = [
      { type: SectionType.HEADER, key: "header" },
      { type: SectionType.GARDENS, key: "gardens" },
    ];

    // Add sensors section (even if no garden is selected, we'll show a prompt)
    constructedSections.push({ type: SectionType.SENSORS, key: "sensors" });

    // Add weather section if we have weather data
    if (weatherData) {
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

    // Add quick actions for any selected garden
    if (selectedGardenId) {
      constructedSections.push({
        type: SectionType.QUICK_ACTIONS,
        key: "quick_actions",
      });
    }

    return constructedSections;
  }, [
    weatherData,
    selectedGardenId,
    gardenAlerts,
    recentActivities,
    upcomingSchedules,
  ]);

  // Key extractor for the sections - define this before renderSection to keep hook order consistent
  const keyExtractor = useCallback((item: Section) => item.key, []);

  // Render different sections
  const renderSection = useCallback(
    ({ item: section }: { item: Section }) => {
      switch (section.type) {
        case SectionType.HEADER:
          return (
            <HeaderBar
              userName={user?.firstName || ""}
              hasNotifications={Object.values(gardenAlerts).flat().length > 0}
            />
          );

        case SectionType.GARDENS:
          return (
            <GardenDisplay
              gardens={gardens}
              selectedGardenId={selectedGardenId}
              onSelectGarden={handleSelectGarden}
              onTogglePinGarden={handleTogglePinGarden}
            />
          );

        case SectionType.SENSORS:
          return (
            <SensorDisplay
              selectedGardenId={selectedGardenId}
              sensorDataByType={sensorDataByType as any}
              getSensorStatus={getSensorStatus}
              getSensorIconName={getSensorIconName as any}
            />
          );

        case SectionType.WEATHER:
          if (!weatherData) return null;

          return (
            <WeatherDisplay
              currentWeather={weatherData}
              selectedGarden={gardens.find((g) => g.id === selectedGardenId)}
              getWeatherTip={getWeatherTip}
            />
          );

        case SectionType.ALERTS:
          return (
            <AlertCenter
              alerts={gardenAlerts}
              selectedGardenId={selectedGardenId}
            />
          );

        case SectionType.ACTIVITY:
          return (
            <ActivityTimeline
              recentActivities={recentActivities}
              upcomingSchedules={upcomingSchedules}
              selectedGardenId={selectedGardenId}
            />
          );

        case SectionType.QUICK_ACTIONS:
          return (
            <QuickActions
              selectedGardenId={selectedGardenId}
              gardens={gardens}
              alerts={gardenAlerts}
            />
          );

        default:
          return null;
      }
    },
    [
      user,
      gardens,
      selectedGardenId,
      weatherData,
      sensorDataByType,
      gardenAlerts,
      handleSelectGarden,
      handleTogglePinGarden,
      getSensorStatus,
      getSensorIconName,
      getWeatherTip,
      recentActivities,
      upcomingSchedules,
    ]
  );

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

  // Platform-specific paddings for header safety
  const containerStyle: StyleProp<ViewStyle> = {
    ...styles.container,
    ...(Platform.OS === "android" ? { paddingTop: 8 } : {}),
  };

  return (
    <SafeAreaView
      style={[containerStyle, { backgroundColor: theme.background }]}
      edges={["right", "left"]}
    >
      <FlatList
        data={sections}
        renderItem={renderSection}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews={Platform.OS !== "web"}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
            progressViewOffset={20}
          />
        }
        ListFooterComponent={
          <Animated.View
            style={[
              styles.footer,
              {
                opacity: refreshAnimationRef.current.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            ]}
          >
            <Text style={[styles.footerText, { color: theme.textTertiary }]}>
              Smart Farm • Phiên bản 1.0.0
            </Text>
          </Animated.View>
        }
      />
    </SafeAreaView>
  );
}
