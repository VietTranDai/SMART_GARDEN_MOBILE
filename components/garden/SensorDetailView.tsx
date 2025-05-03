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
import { Sensor, SensorType, SensorData } from "@/types";

interface SensorDetailViewProps {
  // Danh sách các sensor (metadata)
  sensors: Sensor[];
  // Toàn bộ readings của mọi sensor
  data: SensorData[];
  onSelectSensor?: (sensor: Sensor) => void;
}

export default function SensorDetailView({
  sensors,
  data,
  onSelectSensor,
}: SensorDetailViewProps) {
  const theme = useAppTheme();
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(
    sensors.length > 0 ? sensors[0] : null
  );

  const screenWidth = Dimensions.get("window").width - 32;

  const handleSelectSensor = (sensor: Sensor) => {
    setSelectedSensor(sensor);
    onSelectSensor?.(sensor);
  };

  // Lọc readings chỉ cho sensor đang chọn
  const readings = selectedSensor
    ? data.filter((d) => d.sensorId === selectedSensor.id)
    : [];

  // Sắp xếp readings theo thời gian tăng dần
  const sortedReadings = [...readings].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Lấy reading cuối cùng để hiển thị current value
  const latestReading = sortedReadings[sortedReadings.length - 1];

  // Chuẩn bị data cho chart: chỉ lấy tối đa 24 readings cuối
  const chartReadings = sortedReadings.slice(-24);

  const formatChartData = (readings: SensorData[], type: SensorType) => ({
    labels: readings.map((r) => {
      const d = new Date(r.timestamp);
      return `${d.getHours()}:${d.getMinutes().toString().padStart(2, "0")}`;
    }),
    datasets: [
      {
        data: readings.map((r) => r.value),
        color: () => theme.primary,
        strokeWidth: 2,
      },
    ],
    legend: [getSensorName(type)],
  });

  const chartData = formatChartData(
    chartReadings,
    selectedSensor?.type ?? SensorType.TEMPERATURE
  );

  // Tiện helper (giữ nguyên từ bản cũ)
  const getSensorIcon = (type: SensorType) => {
    switch (type) {
      case SensorType.TEMPERATURE:
        return "temperature-high";
      case SensorType.HUMIDITY:
        return "cloud-rain";
      case SensorType.SOIL_MOISTURE:
        return "water";
      case SensorType.LIGHT:
        return "sun";
      case SensorType.WATER_LEVEL:
        return "layer-group";
      case SensorType.RAINFALL:
        return "cloud-showers-heavy";
      case SensorType.SOIL_PH:
        return "vial";
      default:
        return "question";
    }
  };

  const getSensorUnit = (type: SensorType) => {
    switch (type) {
      case SensorType.TEMPERATURE:
        return "°C";
      case SensorType.HUMIDITY:
      case SensorType.SOIL_MOISTURE:
      case SensorType.LIGHT:
        return "%";
      case SensorType.WATER_LEVEL:
        return "cm";
      case SensorType.RAINFALL:
        return "mm";
      case SensorType.SOIL_PH:
        return "pH";
      default:
        return "";
    }
  };

  const getSensorName = (type: SensorType) => {
    switch (type) {
      case SensorType.TEMPERATURE:
        return "Nhiệt độ";
      case SensorType.HUMIDITY:
        return "Độ ẩm";
      case SensorType.SOIL_MOISTURE:
        return "Độ ẩm đất";
      case SensorType.LIGHT:
        return "Ánh sáng";
      case SensorType.WATER_LEVEL:
        return "Mực nước";
      case SensorType.RAINFALL:
        return "Lượng mưa";
      case SensorType.SOIL_PH:
        return "Độ pH đất";
      default:
        return "Không rõ";
    }
  };

  const getSensorStatus = (type: SensorType, value: number) => {
    // Giữ nguyên logic thresholds từ bản cũ...
    switch (type) {
      case SensorType.TEMPERATURE:
        if (value < 10 || value > 35) return "critical";
        if (value < 15 || value > 30) return "warning";
        return "normal";
      case SensorType.HUMIDITY:
        if (value < 30 || value > 90) return "critical";
        if (value < 40 || value > 80) return "warning";
        return "normal";
      case SensorType.SOIL_MOISTURE:
        if (value < 20) return "critical";
        if (value < 40) return "warning";
        return "normal";
      case SensorType.LIGHT:
        if (value < 30) return "critical";
        if (value < 50) return "warning";
        return "normal";
      case SensorType.WATER_LEVEL:
        if (value < 5) return "critical";
        if (value < 10) return "warning";
        return "normal";
      case SensorType.RAINFALL:
        if (value > 50) return "warning";
        return "normal";
      case SensorType.SOIL_PH:
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

  const getStatusText = (status: string) => {
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

  const formatDateTime = (ts: string) =>
    new Date(ts).toLocaleString("vi-VN", {
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
    });

  if (!selectedSensor) {
    return (
      <View style={[styles.container, { backgroundColor: theme.card }]}>
        <Text style={[styles.noDataText, { color: theme.textSecondary }]}>
          Không có dữ liệu cảm biến
        </Text>
      </View>
    );
  }

  const status = latestReading
    ? getSensorStatus(selectedSensor.type, latestReading.value)
    : "normal";
  const statusColor = getStatusColor(status);

  // Tách RGB cho chart
  const hexToRgb = (hex: string) => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m
      ? {
          r: parseInt(m[1], 16),
          g: parseInt(m[2], 16),
          b: parseInt(m[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };
  const primaryRgb = hexToRgb(theme.primary);

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        Số liệu cảm biến
      </Text>

      {/* Tabs chọn sensor */}
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
              selectedSensor.id === sensor.id
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
                selectedSensor.id === sensor.id
                  ? theme.primary
                  : theme.textSecondary
              }
            />
            <Text
              style={[
                styles.sensorTabText,
                selectedSensor.id === sensor.id
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

      {/* Thông tin sensor đang chọn */}
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
          {latestReading && (
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
                {latestReading.value}
                <Text style={styles.unit}>
                  {getSensorUnit(selectedSensor.type)}
                </Text>
              </Text>
              <View
                style={[styles.statusBadge, { backgroundColor: statusColor }]}
              >
                <Text style={styles.statusText}>{getStatusText(status)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Biểu đồ 24h */}
        <View style={styles.chartContainer}>
          <Text style={[styles.chartTitle, { color: theme.textSecondary }]}>
            Lịch sử 24 giờ
          </Text>
          {chartReadings.length > 0 ? (
            <LineChart
              data={{
                ...chartData,
                labels: chartData.labels.filter(
                  (_, i) => i % Math.ceil(chartData.labels.length / 4) === 0
                ),
              }}
              width={screenWidth - 40}
              height={200}
              chartConfig={{
                backgroundColor: theme.card,
                backgroundGradientFrom: theme.card,
                backgroundGradientTo: theme.card,
                decimalPlaces: 1,
                color: (opacity = 1) =>
                  `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, ${opacity})`,
                labelColor: () => theme.textSecondary,
                style: { borderRadius: 8 },
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
              segments={4}
              fromZero={false}
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

        {/* Bảng 10 readings mới nhất */}
        <View style={styles.latestReadingsContainer}>
          <Text style={[styles.latestReadingsTitle, { color: theme.text }]}>
            Latest Readings
          </Text>
          <ScrollView style={styles.readingsTable}>
            {sortedReadings.length > 0 ? (
              sortedReadings
                .slice(-10)
                .reverse()
                .map((r, idx) => {
                  const s = getSensorStatus(selectedSensor.type, r.value);
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.readingRow,
                        {
                          backgroundColor:
                            idx % 2 === 0
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
                        {formatDateTime(r.timestamp)}
                      </Text>
                      <Text
                        style={[styles.readingValue, { color: theme.text }]}
                      >
                        {r.value}
                        {getSensorUnit(selectedSensor.type)}
                      </Text>
                      <View
                        style={[
                          styles.readingStatus,
                          { backgroundColor: getStatusColor(s) },
                        ]}
                      />
                    </View>
                  );
                })
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
