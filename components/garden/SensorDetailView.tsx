import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { LineChart } from "react-native-chart-kit";

// Types based on Prisma schema
export type SensorType =
  | "HUMIDITY"
  | "TEMPERATURE"
  | "LIGHT"
  | "WATER_LEVEL"
  | "RAINFALL"
  | "SOIL_MOISTURE"
  | "SOIL_PH";

interface SensorReading {
  timestamp: string;
  value: number;
}

export interface SensorInfo {
  id: number;
  sensorKey: string;
  type: SensorType;
  createdAt: string;
  updatedAt: string;
  lastReading?: number;
  readings: SensorReading[];
}

interface SensorDetailViewProps {
  sensors: SensorInfo[];
  onSelectSensor?: (sensor: SensorInfo) => void;
}

// Function to convert hex color to RGB (simplified, assumes hex is valid)
const hexToRgb = (hex: string) => {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 }; // Fallback to black
};

export default function SensorDetailView({
  sensors,
  onSelectSensor,
}: SensorDetailViewProps) {
  const theme = useAppTheme();
  const [selectedSensor, setSelectedSensor] = useState<SensorInfo | null>(
    sensors.length > 0 ? sensors[0] : null
  );

  const screenWidth = Dimensions.get("window").width - 32; // Account for padding

  const handleSelectSensor = (sensor: SensorInfo) => {
    setSelectedSensor(sensor);
    if (onSelectSensor) {
      onSelectSensor(sensor);
    }
  };

  // Sensor icon and unit mapping
  const getSensorIcon = (type: SensorType) => {
    switch (type) {
      case "TEMPERATURE":
        return "temperature-high";
      case "HUMIDITY":
        return "cloud-rain";
      case "SOIL_MOISTURE":
        return "water";
      case "LIGHT":
        return "sun";
      case "WATER_LEVEL":
        return "layer-group";
      case "RAINFALL":
        return "cloud-showers-heavy";
      case "SOIL_PH":
        return "vial";
      default:
        return "question";
    }
  };

  const getSensorUnit = (type: SensorType) => {
    switch (type) {
      case "TEMPERATURE":
        return "°C";
      case "HUMIDITY":
      case "SOIL_MOISTURE":
      case "LIGHT":
        return "%";
      case "WATER_LEVEL":
        return "cm";
      case "RAINFALL":
        return "mm";
      case "SOIL_PH":
        return "pH";
      default:
        return "";
    }
  };

  const getSensorName = (type: SensorType) => {
    switch (type) {
      case "TEMPERATURE":
        return "Nhiệt độ";
      case "HUMIDITY":
        return "Độ ẩm";
      case "SOIL_MOISTURE":
        return "Độ ẩm đất";
      case "LIGHT":
        return "Ánh sáng";
      case "WATER_LEVEL":
        return "Mực nước";
      case "RAINFALL":
        return "Lượng mưa";
      case "SOIL_PH":
        return "Độ pH đất";
      default:
        return "Không rõ";
    }
  };

  const getSensorStatus = (type: SensorType, value: number) => {
    // These thresholds would ideally come from a configuration or be plant-specific
    switch (type) {
      case "TEMPERATURE":
        if (value < 10 || value > 35) return "critical";
        if (value < 15 || value > 30) return "warning";
        return "normal";
      case "HUMIDITY":
        if (value < 30 || value > 90) return "critical";
        if (value < 40 || value > 80) return "warning";
        return "normal";
      case "SOIL_MOISTURE":
        if (value < 20) return "critical";
        if (value < 40) return "warning";
        return "normal";
      case "LIGHT":
        if (value < 30) return "critical";
        if (value < 50) return "warning";
        return "normal";
      case "WATER_LEVEL":
        if (value < 5) return "critical";
        if (value < 10) return "warning";
        return "normal";
      case "RAINFALL":
        // For rainfall, high values might be concerning but not necessarily critical
        if (value > 50) return "warning";
        return "normal";
      case "SOIL_PH":
        if (value < 5.5 || value > 7.5) return "critical";
        if (value < 6.0 || value > 7.0) return "warning";
        return "normal";
      default:
        return "normal";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return theme.success;
      case "warning":
        return theme.warning;
      case "critical":
        return theme.error;
      default:
        return theme.textSecondary;
    }
  };

  // Helper function to display Vietnamese status text
  const getStatusText = (status: string): string => {
    switch (status) {
      case "normal":
        return "Bình thường";
      case "warning":
        return "Cảnh báo";
      case "critical":
        return "Nguy cấp";
      default:
        return "Không rõ";
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    // Use Vietnamese locale
    return date.toLocaleString("vi-VN", {
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Format data for the chart
  const formatChartData = (
    readings: SensorReading[],
    sensorType: SensorType
  ) => {
    // Sort readings by timestamp
    const sortedReadings = [...readings].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Take last 24 readings (or all if less than 24)
    const displayReadings = sortedReadings.slice(-24);

    return {
      labels: displayReadings.map((reading) => {
        const date = new Date(reading.timestamp);
        // Format label as HH:mm
        return `${date.getHours()}:${date
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;
      }),
      datasets: [
        {
          data: displayReadings.map((reading) => reading.value),
          color: () => theme.primary,
          strokeWidth: 2,
        },
      ],
      legend: [getSensorName(sensorType)],
    };
  };

  if (!selectedSensor) {
    return (
      <View style={[styles.container, { backgroundColor: theme.card }]}>
        <Text style={[styles.noDataText, { color: theme.textSecondary }]}>
          Không có dữ liệu cảm biến
        </Text>
      </View>
    );
  }

  const chartData = formatChartData(
    selectedSensor.readings,
    selectedSensor.type
  );

  // Filter labels further for display
  const chartLabelsFiltered = chartData.labels.filter(
    (_, index) => index % Math.ceil(chartData.labels.length / 4) === 0
  ); // Show max ~4-5 labels

  const sensorStatus = getSensorStatus(
    selectedSensor.type,
    selectedSensor.lastReading || 0
  );
  const statusColor = getStatusColor(sensorStatus);
  const statusText = getStatusText(sensorStatus);

  // Get RGB values for chart configuration
  const primaryRgb = hexToRgb(theme.primary);

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        Số liệu cảm biến
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sensorTabs}
      >
        {sensors.map((sensor) => (
          <TouchableOpacity
            key={sensor.id}
            style={[
              styles.sensorTab,
              selectedSensor?.id === sensor.id
                ? {
                    backgroundColor: theme.primaryLight,
                    borderColor: theme.primary,
                  }
                : { borderColor: theme.border },
            ]}
            onPress={() => handleSelectSensor(sensor)}
          >
            <FontAwesome5
              name={getSensorIcon(sensor.type)}
              size={18}
              color={
                selectedSensor?.id === sensor.id
                  ? theme.primary
                  : theme.textSecondary
              }
            />
            <Text
              style={[
                styles.sensorTabText,
                selectedSensor?.id === sensor.id
                  ? { color: theme.primary, fontFamily: "Inter-SemiBold" }
                  : { color: theme.textSecondary },
              ]}
              numberOfLines={1}
            >
              {getSensorName(sensor.type)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.selectedSensorContainer}>
        <View style={styles.sensorHeader}>
          <View style={styles.sensorTypeContainer}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <FontAwesome5
                name={getSensorIcon(selectedSensor.type)}
                size={24}
                color={theme.primary}
              />
            </View>
            <Text style={[styles.sensorType, { color: theme.text }]}>
              {getSensorName(selectedSensor.type)}
            </Text>
          </View>

          {selectedSensor.lastReading !== undefined && (
            <View style={styles.currentValueContainer}>
              <Text
                style={[
                  styles.currentValueLabel,
                  { color: theme.textSecondary },
                ]}
              >
                Số liệu hiện tại:
              </Text>
              <Text style={[styles.currentValue, { color: statusColor }]}>
                {selectedSensor.lastReading}
                <Text style={styles.unit}>
                  {getSensorUnit(selectedSensor.type)}
                </Text>
              </Text>
              <View
                style={[styles.statusBadge, { backgroundColor: statusColor }]}
              >
                <Text style={styles.statusText}>{statusText}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.chartContainer}>
          <Text style={[styles.chartTitle, { color: theme.textSecondary }]}>
            Lịch sử 24 giờ
          </Text>
          {selectedSensor.readings.length > 0 ? (
            <LineChart
              data={{ ...chartData, labels: chartLabelsFiltered }}
              width={screenWidth - 40}
              height={200}
              chartConfig={{
                backgroundColor: theme.card,
                backgroundGradientFrom: theme.card,
                backgroundGradientTo: theme.card,
                decimalPlaces: 1,
                color: (opacity = 1) =>
                  `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, ${opacity})`,
                labelColor: (opacity = 1) => theme.textSecondary,
                style: {
                  borderRadius: 8,
                },
                propsForDots: {
                  r: "4",
                  strokeWidth: "1",
                  stroke: theme.primaryDark,
                },
                propsForBackgroundLines: {
                  strokeDasharray: "",
                  stroke: theme.borderLight,
                },
              }}
              bezier
              style={styles.chartStyle}
              withInnerLines={true}
              withOuterLines={false}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              fromZero={false}
              segments={4}
              verticalLabelRotation={30}
            />
          ) : (
            <View style={styles.noChartDataContainer}>
              <Text
                style={[styles.noChartDataText, { color: theme.textSecondary }]}
              >
                Không đủ dữ liệu để vẽ biểu đồ.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.latestReadingsContainer}>
          <Text style={[styles.latestReadingsTitle, { color: theme.text }]}>
            Latest Readings
          </Text>
          <ScrollView style={styles.readingsTable}>
            {selectedSensor.readings.length > 0 ? (
              selectedSensor.readings
                .slice()
                .sort((a, b) => {
                  return (
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime()
                  );
                })
                .slice(0, 10)
                .map((reading, index) => (
                  <View
                    key={index}
                    style={[
                      styles.readingRow,
                      {
                        backgroundColor:
                          index % 2 === 0
                            ? theme.backgroundSecondary
                            : theme.card,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.readingTimestamp,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {formatDateTime(reading.timestamp)}
                    </Text>
                    <Text style={[styles.readingValue, { color: theme.text }]}>
                      {reading.value}
                      {getSensorUnit(selectedSensor.type)}
                    </Text>
                    <View
                      style={[
                        styles.readingStatus,
                        {
                          backgroundColor: getStatusColor(
                            getSensorStatus(selectedSensor.type, reading.value)
                          ),
                        },
                      ]}
                    />
                  </View>
                ))
            ) : (
              <Text
                style={[styles.noReadingsText, { color: theme.textSecondary }]}
              >
                No readings available
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginVertical: 8,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  noDataText: {
    textAlign: "center",
    marginVertical: 20,
    fontSize: 16,
  },
  sensorTabs: {
    flexDirection: "row",
    marginBottom: 16,
  },
  sensorTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  sensorTabText: {
    fontSize: 12,
    marginLeft: 6,
  },
  selectedSensorContainer: {
    marginTop: 8,
  },
  sensorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sensorTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  sensorType: {
    fontSize: 16,
    fontWeight: "bold",
  },
  currentValueContainer: {
    alignItems: "flex-end",
  },
  currentValueLabel: {
    fontSize: 12,
  },
  currentValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  unit: {
    fontSize: 14,
    fontWeight: "normal",
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  chartContainer: {
    marginVertical: 16,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  noChartDataContainer: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  noChartDataText: {
    fontSize: 14,
  },
  latestReadingsContainer: {
    marginTop: 16,
  },
  latestReadingsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  readingsTable: {
    maxHeight: 300,
  },
  readingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  readingTimestamp: {
    flex: 2,
    fontSize: 12,
  },
  readingValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "right",
  },
  readingStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  noReadingsText: {
    textAlign: "center",
    marginVertical: 12,
    fontSize: 14,
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 8,
  },
});
