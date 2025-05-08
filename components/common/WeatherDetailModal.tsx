import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  FlatList,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import {
  WeatherObservation,
  HourlyForecast,
  DailyForecast,
  WeatherAdvice,
  OptimalGardenTime,
} from "@/types/weather/weather.types";
import { GardenDisplay } from "@/hooks/useHomeData";
import { LineChart } from "react-native-chart-kit";
import { GardenType } from "@/types/gardens/garden.types";
import { weatherService } from "@/service/api";

const { width } = Dimensions.get("window");

interface WeatherDetailModalProps {
  isVisible: boolean;
  onClose: () => void;
  currentWeather: WeatherObservation | null;
  hourlyForecast: HourlyForecast[];
  dailyForecast: DailyForecast[];
  weatherAdvice: WeatherAdvice[];
  optimalTimes: OptimalGardenTime[];
  garden?: GardenDisplay;
  isLoading: boolean;
  theme: any;
}

export default function WeatherDetailModal({
  isVisible,
  onClose,
  currentWeather,
  hourlyForecast,
  dailyForecast,
  weatherAdvice,
  optimalTimes,
  garden,
  isLoading,
  theme,
}: WeatherDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"forecast" | "advice" | "optimal">(
    "forecast"
  );

  // Format Hour for Chart Labels
  const formatHour = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      hour12: false,
    });
  };

  // Tạo dữ liệu cho biểu đồ nhiệt độ
  const temperatureChartData = useMemo(() => {
    if (!hourlyForecast || hourlyForecast.length === 0) return null;

    const next24Hours = hourlyForecast.slice(0, 24);
    return {
      labels: next24Hours.map((h) => formatHour(h.forecastFor)),
      datasets: [
        {
          data: next24Hours.map((h) => Math.round(h.temp)),
          color: () => theme.primary,
          strokeWidth: 2,
        },
      ],
      legend: ["Nhiệt độ (°C)"],
    };
  }, [hourlyForecast, theme.primary]);

  // Tạo dữ liệu cho biểu đồ xác suất mưa
  const rainChartData = useMemo(() => {
    if (!hourlyForecast || hourlyForecast.length === 0) return null;

    const next24Hours = hourlyForecast.slice(0, 24);
    return {
      labels: next24Hours.map((h) => formatHour(h.forecastFor)),
      datasets: [
        {
          data: next24Hours.map((h) => Math.round(h.pop * 100)),
          color: () => "#4da6ff",
          strokeWidth: 2,
        },
      ],
      legend: ["Khả năng mưa (%)"],
    };
  }, [hourlyForecast]);

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="cloud-offline-outline"
        size={48}
        color={theme.textSecondary}
      />
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        {activeTab === "forecast"
          ? "Không có dữ liệu dự báo"
          : activeTab === "advice"
          ? "Không có lời khuyên"
          : "Không tìm thấy thời gian tối ưu"}
      </Text>
    </View>
  );

  // Render dự báo theo giờ
  const renderHourlyForecast = () => {
    if (hourlyForecast.length === 0) return renderEmptyState();

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hourlyContainer}
      >
        {hourlyForecast.slice(0, 24).map((hour, index) => (
          <View
            key={`hour-${index}`}
            style={[
              styles.hourlyItem,
              {
                backgroundColor:
                  index === 0 ? `${theme.primary}15` : theme.card,
              },
            ]}
          >
            <Text style={[styles.hourTime, { color: theme.text }]}>
              {formatHour(hour.forecastFor)}
            </Text>
            <Image
              source={{ uri: weatherService.getWeatherIcon(hour.iconCode) }}
              style={styles.hourlyIcon}
            />
            <Text style={[styles.hourTemp, { color: theme.text }]}>
              {Math.round(hour.temp)}°C
            </Text>
            <View style={styles.precipContainer}>
              <Ionicons
                name="water-outline"
                size={12}
                color={theme.textSecondary}
              />
              <Text style={[styles.precipText, { color: theme.textSecondary }]}>
                {Math.round(hour.pop * 100)}%
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  // Render dự báo theo ngày
  const renderDailyForecast = () => {
    if (dailyForecast.length === 0) return null;

    return (
      <View style={styles.dailyContainer}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Dự báo 7 ngày tới
        </Text>
        {dailyForecast.map((day, index) => (
          <View
            key={`day-${index}`}
            style={[
              styles.dailyItem,
              { borderBottomColor: `${theme.border}30` },
            ]}
          >
            <Text
              style={[
                styles.dayName,
                { color: theme.text, flex: 1, marginRight: 8 },
              ]}
            >
              {weatherService.formatDay(day.forecastFor)}
            </Text>
            <View style={styles.dayIconContainer}>
              <Image
                source={{ uri: weatherService.getWeatherIcon(day.iconCode) }}
                style={styles.dailyIcon}
              />
            </View>
            <View style={styles.tempRangeContainer}>
              <Text style={[styles.maxTemp, { color: theme.text }]}>
                {Math.round(day.tempMax)}°
              </Text>
              <View style={[styles.tempBar, { backgroundColor: theme.border }]}>
                <View
                  style={[
                    styles.tempBarFill,
                    {
                      backgroundColor: theme.primary,
                      width: `${
                        ((day.tempMax - day.tempMin) /
                          (day.tempMax - day.tempMin + 5)) *
                        100
                      }%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.minTemp, { color: theme.textSecondary }]}>
                {Math.round(day.tempMin)}°
              </Text>
            </View>
            <View style={styles.precipContainer}>
              <Ionicons
                name="water-outline"
                size={14}
                color={theme.textSecondary}
              />
              <Text
                style={[styles.dailyPrecip, { color: theme.textSecondary }]}
              >
                {Math.round(day.pop * 100)}%
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  // Render biểu đồ
  const renderCharts = () => {
    if (!temperatureChartData || !rainChartData) return null;

    return (
      <View style={styles.chartsContainer}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Biểu đồ nhiệt độ (24 giờ tới)
        </Text>
        <LineChart
          data={temperatureChartData}
          width={width - 40}
          height={180}
          chartConfig={{
            backgroundColor: theme.card,
            backgroundGradientFrom: theme.card,
            backgroundGradientTo: theme.card,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(78, 153, 224, ${opacity})`,
            labelColor: (opacity = 1) => theme.textSecondary,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "5",
              strokeWidth: "2",
              stroke: theme.primary,
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Xác suất mưa (24 giờ tới)
        </Text>
        <LineChart
          data={rainChartData}
          width={width - 40}
          height={180}
          chartConfig={{
            backgroundColor: theme.card,
            backgroundGradientFrom: theme.card,
            backgroundGradientTo: theme.card,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(77, 166, 255, ${opacity})`,
            labelColor: (opacity = 1) => theme.textSecondary,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "5",
              strokeWidth: "2",
              stroke: "#4da6ff",
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>
    );
  };

  // Render lời khuyên
  const renderAdvice = () => {
    if (weatherAdvice.length === 0) return renderEmptyState();

    return (
      <FlatList
        data={weatherAdvice}
        keyExtractor={(item) => `advice-${item.id}`}
        renderItem={({ item }) => (
          <View
            style={[
              styles.adviceItem,
              { backgroundColor: `${theme.primary}10` },
            ]}
          >
            <View style={styles.adviceHeader}>
              <View
                style={[
                  styles.adviceIconContainer,
                  { backgroundColor: `${theme.primary}20` },
                ]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={theme.primary}
                />
              </View>
              <View style={styles.adviceTitleContainer}>
                <Text style={[styles.adviceTitle, { color: theme.text }]}>
                  {item.title}
                </Text>
                {item.bestTimeOfDay && (
                  <Text
                    style={[styles.adviceTime, { color: theme.textSecondary }]}
                  >
                    Thời gian tốt nhất: {item.bestTimeOfDay}
                  </Text>
                )}
              </View>
              <View
                style={[
                  styles.priorityBadge,
                  {
                    backgroundColor:
                      item.priority >= 4
                        ? theme.warning
                        : item.priority >= 3
                        ? theme.primary
                        : theme.textSecondary,
                  },
                ]}
              >
                <Text style={styles.priorityText}>
                  {item.priority >= 4
                    ? "Quan trọng"
                    : item.priority >= 3
                    ? "Đề xuất"
                    : "Gợi ý"}
                </Text>
              </View>
            </View>
            <Text
              style={[styles.adviceDescription, { color: theme.textSecondary }]}
            >
              {item.description}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.adviceContainer}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  // Render thời gian tối ưu
  const renderOptimalTimes = () => {
    if (optimalTimes.length === 0) return renderEmptyState();

    return (
      <FlatList
        data={optimalTimes}
        keyExtractor={(item, index) => `optimal-${index}`}
        renderItem={({ item }) => (
          <View
            style={[
              styles.optimalItem,
              {
                backgroundColor:
                  item.score >= 70
                    ? `${theme.success}15`
                    : item.score >= 50
                    ? `${theme.primary}15`
                    : `${theme.textSecondary}15`,
              },
            ]}
          >
            <View style={styles.optimalHeader}>
              <View
                style={[
                  styles.optimalScoreBadge,
                  {
                    backgroundColor:
                      item.score >= 70
                        ? theme.success
                        : item.score >= 50
                        ? theme.primary
                        : theme.textSecondary,
                  },
                ]}
              >
                <Text style={styles.optimalScoreText}>{item.score}%</Text>
              </View>
              <View style={styles.optimalTitleContainer}>
                <Text style={[styles.optimalTitle, { color: theme.text }]}>
                  {item.activity}
                </Text>
                <Text
                  style={[
                    styles.optimalTimeRange,
                    { color: theme.textSecondary },
                  ]}
                >
                  {weatherService.formatTime(item.startTime)} -{" "}
                  {weatherService.formatTime(item.endTime)}
                </Text>
              </View>
              <Image
                source={{
                  uri: weatherService.getWeatherIcon(
                    `${
                      item.weatherCondition === "CLEAR"
                        ? "01"
                        : item.weatherCondition === "CLOUDS"
                        ? "02"
                        : item.weatherCondition === "RAIN"
                        ? "10"
                        : "50"
                    }d`
                  ),
                }}
                style={styles.optimalIcon}
              />
            </View>
            <View style={styles.optimalDetails}>
              <View style={styles.optimalDetailItem}>
                <Ionicons
                  name="thermometer-outline"
                  size={16}
                  color={theme.textSecondary}
                />
                <Text
                  style={[
                    styles.optimalDetailText,
                    { color: theme.textSecondary },
                  ]}
                >
                  {Math.round(item.temperature)}°C
                </Text>
              </View>
              <View style={styles.optimalDetailItem}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={theme.textSecondary}
                />
                <Text
                  style={[
                    styles.optimalDetailText,
                    { color: theme.textSecondary },
                  ]}
                >
                  {new Date(item.startTime).toLocaleDateString("vi-VN", {
                    weekday: "long",
                  })}
                </Text>
              </View>
            </View>
            <Text
              style={[styles.optimalReason, { color: theme.textSecondary }]}
            >
              {item.reason}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.optimalContainer}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  // Render current weather
  const renderCurrentWeather = () => {
    if (!currentWeather) return null;

    const weatherColor = weatherService.getWeatherBackgroundColor(
      currentWeather.weatherMain
    )[0];

    return (
      <View
        style={[
          styles.currentWeatherContainer,
          { backgroundColor: weatherColor },
        ]}
      >
        <View style={styles.currentLeftContainer}>
          <Text style={styles.currentTemp}>
            {Math.round(currentWeather.temp)}°
          </Text>
          <Text style={styles.currentDesc}>
            {currentWeather.weatherDesc.charAt(0).toUpperCase() +
              currentWeather.weatherDesc.slice(1)}
          </Text>
          <Text style={styles.currentFeelsLike}>
            Cảm giác như {Math.round(currentWeather.feelsLike)}°
          </Text>
        </View>
        <View style={styles.currentRightContainer}>
          <Image
            source={{
              uri: weatherService.getWeatherIcon(currentWeather.iconCode),
            }}
            style={styles.currentIcon}
          />
          <View style={styles.currentStatsContainer}>
            <View style={styles.currentStatItem}>
              <FontAwesome5 name="wind" size={12} color="#fff" />
              <Text style={styles.currentStatText}>
                {currentWeather.windSpeed} m/s{" "}
                {weatherService.getWindDirection(currentWeather.windDeg)}
              </Text>
            </View>
            <View style={styles.currentStatItem}>
              <FontAwesome5 name="tint" size={12} color="#fff" />
              <Text style={styles.currentStatText}>
                {currentWeather.humidity}%
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "forecast":
        return (
          <>
            {renderHourlyForecast()}
            {renderCharts()}
            {renderDailyForecast()}
          </>
        );
      case "advice":
        return renderAdvice();
      case "optimal":
        return renderOptimalTimes();
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View
        style={[styles.modalContainer, { backgroundColor: "rgba(0,0,0,0.5)" }]}
      >
        <View
          style={[styles.modalContent, { backgroundColor: theme.background }]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Thời tiết {garden ? `tại ${garden.name}` : ""}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text
                style={[styles.loadingText, { color: theme.textSecondary }]}
              >
                Đang tải dữ liệu thời tiết...
              </Text>
            </View>
          ) : (
            <>
              {/* Current Weather */}
              {renderCurrentWeather()}

              {/* Tab Selector */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeTab === "forecast" && [
                      styles.activeTabButton,
                      { borderBottomColor: theme.primary },
                    ],
                  ]}
                  onPress={() => setActiveTab("forecast")}
                >
                  <Text
                    style={[
                      styles.tabButtonText,
                      {
                        color:
                          activeTab === "forecast"
                            ? theme.primary
                            : theme.textSecondary,
                      },
                    ]}
                  >
                    Dự báo
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeTab === "advice" && [
                      styles.activeTabButton,
                      { borderBottomColor: theme.primary },
                    ],
                  ]}
                  onPress={() => setActiveTab("advice")}
                >
                  <Text
                    style={[
                      styles.tabButtonText,
                      {
                        color:
                          activeTab === "advice"
                            ? theme.primary
                            : theme.textSecondary,
                      },
                    ]}
                  >
                    Lời khuyên
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeTab === "optimal" && [
                      styles.activeTabButton,
                      { borderBottomColor: theme.primary },
                    ],
                  ]}
                  onPress={() => setActiveTab("optimal")}
                >
                  <Text
                    style={[
                      styles.tabButtonText,
                      {
                        color:
                          activeTab === "optimal"
                            ? theme.primary
                            : theme.textSecondary,
                      },
                    ]}
                  >
                    Thời gian tối ưu
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Tab Content */}
              <ScrollView
                style={styles.contentScrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
              >
                {renderTabContent()}
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "90%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Inter-Regular",
  },
  currentWeatherContainer: {
    flexDirection: "row",
    padding: 20,
    borderRadius: 0,
  },
  currentLeftContainer: {
    flex: 1,
  },
  currentRightContainer: {
    alignItems: "flex-end",
  },
  currentTemp: {
    fontSize: 48,
    fontFamily: "Inter-Bold",
    color: "#fff",
  },
  currentDesc: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    color: "#fff",
    marginBottom: 8,
  },
  currentFeelsLike: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "rgba(255,255,255,0.8)",
  },
  currentIcon: {
    width: 80,
    height: 80,
  },
  currentStatsContainer: {
    marginTop: 8,
  },
  currentStatItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  currentStatText: {
    marginLeft: 4,
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter-Regular",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  activeTabButton: {
    borderBottomWidth: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  contentScrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  hourlyContainer: {
    paddingVertical: 16,
  },
  hourlyItem: {
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 12,
    width: 80,
  },
  hourTime: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    marginBottom: 4,
  },
  hourlyIcon: {
    width: 40,
    height: 40,
  },
  hourTemp: {
    fontSize: 16,
    fontFamily: "Inter-Bold",
    marginVertical: 2,
  },
  precipContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  precipText: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    marginLeft: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    marginTop: 24,
    marginBottom: 12,
  },
  chartsContainer: {
    marginVertical: 8,
  },
  dailyContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  dailyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dayName: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  dayIconContainer: {
    width: 40,
    alignItems: "center",
  },
  dailyIcon: {
    width: 36,
    height: 36,
  },
  tempRangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginHorizontal: 8,
  },
  tempBar: {
    height: 4,
    borderRadius: 2,
    flex: 1,
    marginHorizontal: 8,
  },
  tempBarFill: {
    height: 4,
    borderRadius: 2,
  },
  maxTemp: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  minTemp: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  dailyPrecip: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    marginLeft: 2,
  },
  adviceContainer: {
    paddingVertical: 16,
  },
  adviceItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  adviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  adviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  adviceTitleContainer: {
    flex: 1,
  },
  adviceTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
  },
  adviceTime: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    marginTop: 2,
  },
  adviceDescription: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    lineHeight: 20,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  priorityText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Inter-SemiBold",
  },
  optimalContainer: {
    paddingVertical: 16,
  },
  optimalItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  optimalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  optimalScoreBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  optimalScoreText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter-Bold",
  },
  optimalTitleContainer: {
    flex: 1,
  },
  optimalTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
  },
  optimalTimeRange: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    marginTop: 2,
  },
  optimalIcon: {
    width: 40,
    height: 40,
  },
  optimalDetails: {
    flexDirection: "row",
    marginBottom: 8,
  },
  optimalDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  optimalDetailText: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    marginLeft: 4,
  },
  optimalReason: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
});
