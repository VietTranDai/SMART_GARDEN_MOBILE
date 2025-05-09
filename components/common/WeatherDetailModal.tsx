import React, { useMemo, useState, useEffect } from "react";
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
import { GardenDisplayDto } from "@/types/gardens/dtos";
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
  garden?: GardenDisplayDto;
  isLoading: boolean;
  theme: any;
}

export default function WeatherDetailModal({
  isVisible,
  onClose,
  currentWeather,
  hourlyForecast = [],
  dailyForecast = [],
  weatherAdvice = [],
  optimalTimes = [],
  garden,
  isLoading,
  theme,
}: WeatherDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"forecast" | "advice" | "optimal">(
    "forecast"
  );


  const safeHourlyForecast = useMemo(() => {
    try {
      if (!hourlyForecast) return [];
      if (!Array.isArray(hourlyForecast)) {
        console.warn("hourlyForecast is not an array");
        return [];
      }
      if (hourlyForecast.length === 0) return [];

      return hourlyForecast.map((item) => {
        if (!item || typeof item !== "object") return {} as HourlyForecast;
        return { ...item } as HourlyForecast;
      });
    } catch (error) {
      console.error("Error creating safeHourlyForecast:", error);
      return [];
    }
  }, [hourlyForecast]);

  const safeDailyForecast = useMemo(() => {
    try {
      if (!dailyForecast) return [];
      if (!Array.isArray(dailyForecast)) {
        console.warn("dailyForecast is not an array");
        return [];
      }
      if (dailyForecast.length === 0) return [];

      return dailyForecast.map((item) => {
        if (!item || typeof item !== "object") return {} as DailyForecast;
        return { ...item } as DailyForecast;
      });
    } catch (error) {
      console.error("Error creating safeDailyForecast:", error);
      return [];
    }
  }, [dailyForecast]);

  const safeWeatherAdvice = useMemo(() => {
    try {
      if (!weatherAdvice) return [];
      if (!Array.isArray(weatherAdvice)) {
        console.warn("weatherAdvice is not an array");
        return [];
      }
      if (weatherAdvice.length === 0) return [];

      return weatherAdvice.map((item) => {
        if (!item || typeof item !== "object") return {} as WeatherAdvice;
        return { ...item } as WeatherAdvice;
      });
    } catch (error) {
      console.error("Error creating safeWeatherAdvice:", error);
      return [];
    }
  }, [weatherAdvice]);

  const safeOptimalTimes = useMemo(() => {
    try {
      if (!optimalTimes) return [];
      if (!Array.isArray(optimalTimes)) {
        console.warn("optimalTimes is not an array");
        return [];
      }
      if (optimalTimes.length === 0) return [];

      return optimalTimes.map((item) => {
        if (!item || typeof item !== "object") return {} as OptimalGardenTime;
        return { ...item } as OptimalGardenTime;
      });
    } catch (error) {
      console.error("Error creating safeOptimalTimes:", error);
      return [];
    }
  }, [optimalTimes]);

  const formatHour = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        hour12: false,
      });
    } catch (error) {
      console.error("Error formatting hour:", error);
      return "--";
    }
  };

  const temperatureChartData = useMemo(() => {
    if (!Array.isArray(safeHourlyForecast) || safeHourlyForecast.length === 0)
      return null;

    try {
      const next24Hours = safeHourlyForecast.slice(0, 24);
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
    } catch (error) {
      console.error("Error creating temperature chart data:", error);
      return null;
    }
  }, [safeHourlyForecast, theme.primary]);

  const rainChartData = useMemo(() => {
    if (!Array.isArray(safeHourlyForecast) || safeHourlyForecast.length === 0)
      return null;

    try {
      const next24Hours = safeHourlyForecast.slice(0, 24);
      return {
        labels: next24Hours.map((h) => formatHour(h.forecastFor)),
        datasets: [
          {
            data: next24Hours.map((h) => Math.round((h.pop || 0) * 100)),
            color: () => "#4da6ff",
            strokeWidth: 2,
          },
        ],
        legend: ["Khả năng mưa (%)"],
      };
    } catch (error) {
      console.error("Error creating rain chart data:", error);
      return null;
    }
  }, [safeHourlyForecast]);

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

  const renderHourlyForecast = () => {
    try {
      if (
        !Array.isArray(safeHourlyForecast) ||
        safeHourlyForecast.length === 0
      ) {
        return renderEmptyState();
      }

      const safeHourlyData = safeHourlyForecast
        .slice(0, 24)
        .filter(
          (hour): hour is HourlyForecast =>
            hour !== null && typeof hour === "object" && "forecastFor" in hour
        );

      if (safeHourlyData.length === 0) {
        return renderEmptyState();
      }

      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hourlyContainer}
        >
          {safeHourlyData.map((hour, index) => (
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
                <Text
                  style={[styles.precipText, { color: theme.textSecondary }]}
                >
                  {Math.round((hour.pop || 0) * 100)}%
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      );
    } catch (error) {
      console.error("Error rendering hourly forecast:", error);
      return renderEmptyState();
    }
  };

  const renderDailyForecast = () => {
    try {
      if (!Array.isArray(safeDailyForecast) || safeDailyForecast.length === 0) {
        return renderEmptyState();
      }

      const safeDailyData = safeDailyForecast.filter(
        (day): day is DailyForecast =>
          day !== null && typeof day === "object" && "forecastFor" in day
      );

      if (safeDailyData.length === 0) {
        return renderEmptyState();
      }

      return (
        <View style={styles.dailyContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Dự báo 7 ngày tới
          </Text>
          {safeDailyData.map((day, index) => (
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
                <View
                  style={[styles.tempBar, { backgroundColor: theme.border }]}
                >
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
                  {Math.round((day.pop || 0) * 100)}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      );
    } catch (error) {
      console.error("Error rendering daily forecast:", error);
      return renderEmptyState();
    }
  };

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

  const renderAdvice = () => {
    try {
      if (!Array.isArray(safeWeatherAdvice) || safeWeatherAdvice.length === 0) {
        return renderEmptyState();
      }

      const validAdvice = safeWeatherAdvice.filter(
        (item): item is WeatherAdvice =>
          item !== null &&
          typeof item === "object" &&
          "id" in item &&
          "title" in item
      );

      if (validAdvice.length === 0) {
        return renderEmptyState();
      }

      return (
        <FlatList
          data={validAdvice}
          keyExtractor={(item, index) => `advice-${item.id || index}`}
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
                      style={[
                        styles.adviceTime,
                        { color: theme.textSecondary },
                      ]}
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
                style={[
                  styles.adviceDescription,
                  { color: theme.textSecondary },
                ]}
              >
                {item.description}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.adviceContainer}
          showsVerticalScrollIndicator={false}
        />
      );
    } catch (error) {
      console.error("Error rendering advice:", error);
      return renderEmptyState();
    }
  };

  const renderOptimalTimes = () => {
    try {
      if (!Array.isArray(safeOptimalTimes) || safeOptimalTimes.length === 0) {
        return renderEmptyState();
      }

      const validOptimalTimes = safeOptimalTimes.filter(
        (item): item is OptimalGardenTime =>
          item !== null &&
          typeof item === "object" &&
          "activity" in item &&
          "score" in item
      );

      if (validOptimalTimes.length === 0) {
        return renderEmptyState();
      }

      return (
        <FlatList
          data={validOptimalTimes}
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
    } catch (error) {
      console.error("Error rendering optimal times:", error);
      return renderEmptyState();
    }
  };

  const renderCurrentWeather = () => {
    if (!currentWeather) return null;

    try {
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
    } catch (error) {
      console.error("Error rendering current weather:", error);
      return null;
    }
  };

  const renderTabContent = () => {
    try {
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
    } catch (error) {
      console.error("Error rendering tab content:", error);
      return renderEmptyState();
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
              {renderCurrentWeather()}

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
