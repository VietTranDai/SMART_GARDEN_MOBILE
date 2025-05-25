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
  adviceType?: "garden" | "weather";
  optimalTimes: OptimalGardenTime[];
  garden?: GardenDisplayDto;
  isLoading: boolean;
  theme: any;
}

// Helper functions for styling advice items (can be moved or kept here)
const getUrgencyStyle = (
  urgency: string | undefined,
  priority: number | undefined,
  theme: any
) => {
  let text = "Thông tin";
  let color = theme.textSecondary;

  switch (urgency?.toUpperCase()) {
    case "HIGH":
      text = "Rất gấp";
      color = theme.danger || theme.warning;
      break;
    case "MEDIUM":
      text = "Trung bình";
      color = theme.warning || theme.primary;
      break;
    case "LOW":
      text = "Không gấp";
      color = theme.success || theme.info || theme.textSecondary;
      break;
    default:
      if (typeof priority === "number") {
        if (priority >= 8) {
          text = "Rất Quan Trọng";
          color = theme.danger || theme.warning;
        } else if (priority >= 5) {
          text = "Quan Trọng";
          color = theme.warning || theme.primary;
        } else {
          text = "Gợi ý";
          color = theme.success || theme.textSecondary;
        }
      }
      break;
  }
  return { text, color };
};

const formatDifficulty = (difficulty?: string) => {
  if (!difficulty) return "";
  switch (difficulty.toUpperCase()) {
    case "EASY":
      return "Dễ";
    case "MEDIUM":
      return "Trung bình";
    case "HARD":
      return "Khó";
    default:
      return difficulty;
  }
};

interface AdviceListItemProps {
  item: WeatherAdvice;
  theme: any;
  // Pass pre-calculated styles/text to ensure stability for memo
  urgencyInfo: { text: string; color: string };
  difficultyText: string;
}

const AdviceListItem = React.memo<AdviceListItemProps>(
  ({ item, theme, urgencyInfo, difficultyText }) => {
    return (
      <View
        style={[
          styles.adviceItem,
          {
            backgroundColor: theme.card,
          },
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
              name={(item.icon as any) || "information-circle-outline"}
              size={24}
              color={theme.primary}
            />
          </View>
          <View style={styles.adviceTitleContainer}>
            <Text style={[styles.adviceTitle, { color: theme.text }]}>
              {item.title}
            </Text>
            {difficultyText && (
              <Text
                style={[
                  styles.adviceDifficulty,
                  { color: theme.textSecondary },
                ]}
              >
                Độ khó: {difficultyText}
              </Text>
            )}
          </View>
          <View
            style={[
              styles.urgencyBadge,
              { backgroundColor: urgencyInfo.color },
            ]}
          >
            <Text style={styles.urgencyBadgeText}>{urgencyInfo.text}</Text>
          </View>
        </View>

        <Text
          style={[styles.adviceDescription, { color: theme.textSecondary }]}
        >
          {item.description}
        </Text>

        {item.detailedSteps && item.detailedSteps.length > 0 && (
          <View style={styles.adviceDetailSection}>
            <Text style={[styles.adviceDetailTitle, { color: theme.text }]}>
              Các bước thực hiện:
            </Text>
            {item.detailedSteps.map((step, index) => (
              <Text
                key={`step-${index}`}
                style={[
                  styles.adviceDetailText,
                  { color: theme.textSecondary },
                ]}
              >
                • {step}
              </Text>
            ))}
          </View>
        )}

        {item.tips && item.tips.length > 0 && (
          <View style={styles.adviceDetailSection}>
            <Text style={[styles.adviceDetailTitle, { color: theme.text }]}>
              Mẹo hữu ích:
            </Text>
            {item.tips.map((tip, index) => (
              <Text
                key={`tip-${index}`}
                style={[
                  styles.adviceDetailText,
                  { color: theme.textSecondary },
                ]}
              >
                • {tip}
              </Text>
            ))}
          </View>
        )}

        {item.reasons && item.reasons.length > 0 && (
          <View style={styles.adviceDetailSection}>
            <Text style={[styles.adviceDetailTitle, { color: theme.text }]}>
              Lý do:
            </Text>
            {item.reasons.map((reason, index) => (
              <Text
                key={`reason-${index}`}
                style={[
                  styles.adviceDetailText,
                  { color: theme.textSecondary },
                ]}
              >
                • {reason}
              </Text>
            ))}
          </View>
        )}

        {item.personalizedMessage && (
          <View
            style={[
              styles.personalizedMessageContainer,
              { borderLeftColor: theme.primary },
            ]}
          >
            <Ionicons
              name="sparkles-outline"
              size={18}
              color={theme.primary}
              style={styles.personalizedMessageIcon}
            />
            <Text
              style={[styles.personalizedMessageText, { color: theme.text }]}
            >
              {item.personalizedMessage}
            </Text>
          </View>
        )}
      </View>
    );
  }
);

interface OptimalTimeListItemProps {
  item: OptimalGardenTime;
  theme: any;
  weatherService: typeof weatherService; // Pass the service for its utility functions
}

const OptimalTimeListItem = React.memo<OptimalTimeListItemProps>(
  ({ item, theme, weatherService }) => {
    return (
      <View
        style={[
          styles.optimalItem,
          {
            backgroundColor: theme.card,
            borderLeftWidth: 4,
            borderLeftColor:
              item.score >= 70
                ? theme.success
                : item.score >= 50
                  ? theme.primary
                  : theme.textSecondary,
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
              style={[styles.optimalTimeRange, { color: theme.textSecondary }]}
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
              style={[styles.optimalDetailText, { color: theme.textSecondary }]}
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
              style={[styles.optimalDetailText, { color: theme.textSecondary }]}
            >
              {new Date(item.startTime).toLocaleDateString("vi-VN", {
                weekday: "long",
              })}
            </Text>
          </View>
        </View>
        <Text style={[styles.optimalReason, { color: theme.textSecondary }]}>
          {item.reason}
        </Text>
      </View>
    );
  }
);

export default function WeatherDetailModal({
  isVisible,
  onClose,
  currentWeather,
  hourlyForecast = [],
  dailyForecast = [],
  weatherAdvice = [],
  adviceType,
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
        hour: "numeric",
        hour12: false,
      });
    } catch (error) {
      console.error("Error formatting hour:", error);
      return "--";
    }
  };

  const getFilteredHourLabels = (timestamps: string[]) => {
    return timestamps.map((time, index) => {
      const hour = new Date(time).getHours();
      if (hour % 6 === 0) {
        return hour.toString();
      }
      return "";
    });
  };

  const temperatureChartData = useMemo(() => {
    if (!Array.isArray(safeHourlyForecast) || safeHourlyForecast.length === 0)
      return null;

    try {
      const next24Hours = safeHourlyForecast.slice(0, 24);
      const hourlyTemps = next24Hours.map((h) => Math.round(h.temp));
      const timestamps = next24Hours.map((h) => h.forecastFor);

      return {
        labels: getFilteredHourLabels(timestamps),
        datasets: [
          {
            data: hourlyTemps,
            color: () => theme.primary,
            strokeWidth: 2,
          },
        ],
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
      const hourlyRain = next24Hours.map((h) => Math.round((h.pop || 0) * 100));
      const timestamps = next24Hours.map((h) => h.forecastFor);

      return {
        labels: getFilteredHourLabels(timestamps),
        datasets: [
          {
            data: hourlyRain,
            color: () => "#4da6ff",
            strokeWidth: 2,
          },
        ],
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
                    index === 0 ? `${theme.primary}20` : `${theme.card}E6`,
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
                  size={14}
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

    const chartConfig = {
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
        r: "4",
        strokeWidth: "2",
        stroke: theme.primary,
      },
      propsForLabels: {
        fontSize: 12,
        fontWeight: "500",
        fontFamily: "Inter-Medium",
      },
      propsForBackgroundLines: {
        strokeDasharray: "5,5",
        stroke: `${theme.border}50`,
      },
      formatYLabel: (value: string | number) => `${value}°C`,
      formatXLabel: (value: string | number) => String(value || ""),
    };

    const rainChartConfig = {
      ...chartConfig,
      color: (opacity = 1) => `rgba(77, 166, 255, ${opacity})`,
      propsForDots: {
        r: "4",
        strokeWidth: "2",
        stroke: "#4da6ff",
      },
      formatYLabel: (value: string | number) => `${value}%`,
    };

    return (
      <View style={styles.chartsContainer}>
        <View style={styles.chartTitleContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Biểu đồ nhiệt độ (24 giờ tới)
          </Text>
          <Text style={[styles.chartLegend, { color: theme.textSecondary }]}>
            Nhiệt độ (°C)
          </Text>
        </View>

        <LineChart
          data={temperatureChartData}
          width={width - 32}
          height={180}
          chartConfig={chartConfig}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
            paddingRight: 0,
            backgroundColor: `${theme.card}E6`,
            alignSelf: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 2,
          }}
          withDots={true}
          withShadow={false}
          withInnerLines={true}
          withOuterLines={true}
          yAxisInterval={5}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          fromZero={false}
          segments={4}
        />

        <View style={styles.timeUnitContainer}>
          <Text style={[styles.timeUnitText, { color: theme.textSecondary }]}>
            Giờ
          </Text>
        </View>

        <View style={styles.chartTitleContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Xác suất mưa (24 giờ tới)
          </Text>
          <Text style={[styles.chartLegend, { color: theme.textSecondary }]}>
            Khả năng mưa (%)
          </Text>
        </View>

        <LineChart
          data={rainChartData}
          width={width - 32}
          height={180}
          chartConfig={rainChartConfig}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
            paddingRight: 0,
            backgroundColor: `${theme.card}E6`,
            alignSelf: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 2,
          }}
          withDots={true}
          withShadow={false}
          withInnerLines={true}
          withOuterLines={true}
          yAxisInterval={10}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          fromZero={false}
          segments={4}
        />

        <View style={styles.timeUnitContainer}>
          <Text style={[styles.timeUnitText, { color: theme.textSecondary }]}>
            Giờ
          </Text>
        </View>
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

      const getUrgencyStyle = (urgency?: string, priority?: number) => {
        let text = "Thông tin";
        let color = theme.textSecondary;

        switch (urgency?.toUpperCase()) {
          case "HIGH":
            text = "Rất gấp";
            color = theme.danger || theme.warning; // Assuming theme.danger, fallback to warning
            break;
          case "MEDIUM":
            text = "Trung bình";
            color = theme.warning || theme.primary;
            break;
          case "LOW":
            text = "Không gấp";
            color = theme.success || theme.info || theme.textSecondary; // Assuming theme.success or theme.info
            break;
          default:
            // Fallback to numeric priority if urgencyLevel is not specific
            if (typeof priority === "number") {
              if (priority >= 8) {
                // High priority examples from API
                text = "Rất Quan Trọng";
                color = theme.danger || theme.warning;
              } else if (priority >= 5) {
                // Medium priority examples
                text = "Quan Trọng";
                color = theme.warning || theme.primary;
              } else {
                text = "Gợi ý";
                color = theme.success || theme.textSecondary;
              }
            }
            break;
        }
        return { text, color };
      };

      const formatDifficulty = (difficulty?: string) => {
        if (!difficulty) return "";
        switch (difficulty.toUpperCase()) {
          case "EASY":
            return "Dễ";
          case "MEDIUM":
            return "Trung bình";
          case "HARD":
            return "Khó";
          default:
            return difficulty;
        }
      };

      return (
        <FlatList
          data={validAdvice}
          keyExtractor={(item, index) => `advice-${item.id || index}`}
          renderItem={({ item }) => {
            const urgencyInfo = getUrgencyStyle(
              item.urgencyLevel,
              item.priority
            );
            const difficultyText = formatDifficulty(item.difficultyLevel);

            return (
              <View
                style={[
                  styles.adviceItem,
                  {
                    backgroundColor: theme.card,
                  },
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
                      name={(item.icon as any) || "information-circle-outline"}
                      size={24}
                      color={theme.primary}
                    />
                  </View>
                  <View style={styles.adviceTitleContainer}>
                    <Text style={[styles.adviceTitle, { color: theme.text }]}>
                      {item.title}
                    </Text>
                    {difficultyText && (
                      <Text
                        style={[
                          styles.adviceDifficulty,
                          { color: theme.textSecondary },
                        ]}
                      >
                        Độ khó: {difficultyText}
                      </Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.urgencyBadge,
                      { backgroundColor: urgencyInfo.color },
                    ]}
                  >
                    <Text style={styles.urgencyBadgeText}>
                      {urgencyInfo.text}
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

                {item.detailedSteps && item.detailedSteps.length > 0 && (
                  <View style={styles.adviceDetailSection}>
                    <Text
                      style={[styles.adviceDetailTitle, { color: theme.text }]}
                    >
                      Các bước thực hiện:
                    </Text>
                    {item.detailedSteps.map((step, index) => (
                      <Text
                        key={`step-${index}`}
                        style={[
                          styles.adviceDetailText,
                          { color: theme.textSecondary },
                        ]}
                      >
                        • {step}
                      </Text>
                    ))}
                  </View>
                )}

                {item.tips && item.tips.length > 0 && (
                  <View style={styles.adviceDetailSection}>
                    <Text
                      style={[styles.adviceDetailTitle, { color: theme.text }]}
                    >
                      Mẹo hữu ích:
                    </Text>
                    {item.tips.map((tip, index) => (
                      <Text
                        key={`tip-${index}`}
                        style={[
                          styles.adviceDetailText,
                          { color: theme.textSecondary },
                        ]}
                      >
                        • {tip}
                      </Text>
                    ))}
                  </View>
                )}

                {item.reasons && item.reasons.length > 0 && (
                  <View style={styles.adviceDetailSection}>
                    <Text
                      style={[styles.adviceDetailTitle, { color: theme.text }]}
                    >
                      Lý do:
                    </Text>
                    {item.reasons.map((reason, index) => (
                      <Text
                        key={`reason-${index}`}
                        style={[
                          styles.adviceDetailText,
                          { color: theme.textSecondary },
                        ]}
                      >
                        • {reason}
                      </Text>
                    ))}
                  </View>
                )}

                {item.personalizedMessage && (
                  <View
                    style={[
                      styles.personalizedMessageContainer,
                      { borderLeftColor: theme.primary },
                    ]}
                  >
                    <Ionicons
                      name="sparkles-outline"
                      size={18}
                      color={theme.primary}
                      style={styles.personalizedMessageIcon}
                    />
                    <Text
                      style={[
                        styles.personalizedMessageText,
                        { color: theme.text },
                      ]}
                    >
                      {item.personalizedMessage}
                    </Text>
                  </View>
                )}
              </View>
            );
          }}
          contentContainerStyle={[
            styles.adviceContainer,
            styles.contentContainer,
          ]}
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
            <OptimalTimeListItem
              item={item}
              theme={theme}
              weatherService={weatherService}
            />
          )}
          contentContainerStyle={[
            styles.optimalContainer,
            styles.contentContainer,
          ]}
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
            <ScrollView
              style={styles.contentScrollView}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
            >
              {renderHourlyForecast()}
              {renderCharts()}
              {renderDailyForecast()}
            </ScrollView>
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
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
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
                  <Ionicons
                    name="partly-sunny-outline"
                    size={18}
                    color={
                      activeTab === "forecast"
                        ? theme.primary
                        : theme.textSecondary
                    }
                    style={styles.tabIcon}
                  />
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
                  <Ionicons
                    name="bulb-outline"
                    size={18}
                    color={
                      activeTab === "advice"
                        ? theme.primary
                        : theme.textSecondary
                    }
                    style={styles.tabIcon}
                  />
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
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color={
                      activeTab === "optimal"
                        ? theme.primary
                        : theme.textSecondary
                    }
                    style={styles.tabIcon}
                  />
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

              <View style={styles.tabContentContainer}>
                {renderTabContent()}
              </View>
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
    fontSize: 20,
    fontFamily: "Inter-SemiBold",
    fontWeight: "bold",
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
    width: 100,
    height: 100,
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
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  activeTabButton: {
    borderBottomWidth: 3,
  },
  tabIcon: {
    marginRight: 6,
  },
  tabButtonText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
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
    paddingHorizontal: 4,
  },
  hourlyItem: {
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 12,
    width: 85,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  hourTime: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    marginBottom: 4,
  },
  hourlyIcon: {
    width: 44,
    height: 44,
    marginVertical: 4,
  },
  hourTemp: {
    fontSize: 16,
    fontFamily: "Inter-Bold",
    marginVertical: 2,
  },
  precipContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  precipText: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    marginLeft: 4,
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
  chartTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chartLegend: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
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
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2.5,
    elevation: 3,
  },
  adviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  adviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  adviceDifficulty: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    marginTop: 2,
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginLeft: 8,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  urgencyBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter-Bold",
  },
  adviceDetailSection: {
    marginTop: 12,
  },
  adviceDetailTitle: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    marginBottom: 6,
  },
  adviceDetailText: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    lineHeight: 19,
    marginBottom: 3,
  },
  personalizedMessageContainer: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 8,
    borderLeftWidth: 3,
    flexDirection: "row",
    alignItems: "center",
  },
  personalizedMessageIcon: {
    marginRight: 8,
  },
  personalizedMessageText: {
    fontSize: 13,
    fontFamily: "Inter-Italic",
    lineHeight: 19,
    flex: 1,
  },
  optimalContainer: {
    paddingVertical: 16,
  },
  optimalItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2.5,
    elevation: 3,
    borderLeftWidth: 4,
  },
  optimalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  optimalScoreBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  optimalScoreText: {
    color: "#fff",
    fontSize: 14,
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
  timeUnitContainer: {
    alignItems: "center",
    marginTop: -4,
    marginBottom: 20,
  },
  timeUnitText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
  },
  tabContentContainer: {
    flex: 1,
  },
});
