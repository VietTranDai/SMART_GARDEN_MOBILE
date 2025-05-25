import React, { useMemo } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { LineChart } from "react-native-chart-kit";
import { SensorHistory } from "@/types/gardens/garden.types";
import { SensorType } from "@/types/gardens/sensor.types";
import sensorService from "@/service/api/sensor.service";
import Colors from "@/constants/Colors"; // Import Colors for theme type

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Define a more specific type for the theme object
type AppThemeType = typeof Colors.light;

interface SensorHistoryChartProps {
  sensorType: SensorType;
  sensorHistory: SensorHistory;
}

const SensorHistoryChart: React.FC<SensorHistoryChartProps> = ({
  sensorType,
  sensorHistory,
}) => {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const typeName = sensorService.getSensorTypeName(sensorType);
  const unitText = sensorService.getSensorUnitText(
    sensorService.getSensorUnitForType(sensorType)
  );

  // Memoized chart data
  const chartData = useMemo(() => {
    if (
      !sensorHistory ||
      !sensorHistory.readings ||
      sensorHistory.readings.length === 0
    ) {
      return {
        labels: [],
        datasets: [
          {
            data: [0],
            color: () => theme.primary,
          },
        ],
      };
    }

    // Sort readings by timestamp
    const sortedReadings = [...sensorHistory.readings].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Format dates for labels - show day/month or hour depending on data
    const labels = sortedReadings.map((reading) => {
      const date = new Date(reading.timestamp);
      return (
        date.getHours() +
        ":" +
        (date.getMinutes() < 10 ? "0" : "") +
        date.getMinutes()
      );
    });

    // Get every nth label to avoid overcrowding
    const n = Math.max(1, Math.floor(labels.length / 6));
    const filteredLabels = labels.filter((_, i) => i % n === 0);

    // Add optimal range as extra datasets if available
    const datasets = [];

    // Main readings dataset
    datasets.push({
      data: sortedReadings.map((reading) => reading.value),
      color: () => theme.primary,
      strokeWidth: 2,
    });

    // Add optimal min line if available
    if (
      sensorHistory.optimalMin !== undefined &&
      sensorHistory.optimalMin !== null
    ) {
      datasets.push({
        data: Array(sortedReadings.length).fill(sensorHistory.optimalMin),
        color: () => theme.success + "80", // With transparency
        strokeWidth: 1,
        withDots: false,
      });
    }

    // Add optimal max line if available
    if (
      sensorHistory.optimalMax !== undefined &&
      sensorHistory.optimalMax !== null
    ) {
      datasets.push({
        data: Array(sortedReadings.length).fill(sensorHistory.optimalMax),
        color: () => theme.success + "80", // With transparency
        strokeWidth: 1,
        withDots: false,
      });
    }

    return {
      labels: filteredLabels,
      datasets,
    };
  }, [sensorHistory, theme]);

  // Calculate value range for Y axis
  const valueRange = useMemo(() => {
    if (
      !sensorHistory ||
      !sensorHistory.readings ||
      sensorHistory.readings.length === 0
    ) {
      return { min: 0, max: 100 };
    }

    const values = sensorHistory.readings.map((r) => r.value);
    let min = Math.min(...values);
    let max = Math.max(...values);

    // Expand range by optimal values if available
    if (
      sensorHistory.optimalMin !== undefined &&
      sensorHistory.optimalMin !== null
    ) {
      min = Math.min(min, sensorHistory.optimalMin);
    }
    if (
      sensorHistory.optimalMax !== undefined &&
      sensorHistory.optimalMax !== null
    ) {
      max = Math.max(max, sensorHistory.optimalMax);
    }

    // Add some padding to the range
    const padding = (max - min) * 0.1;
    min = Math.max(0, min - padding);
    max = max + padding;

    return { min, max };
  }, [sensorHistory]);

  // Render legend with optimal range
  const renderLegend = () => {
    return (
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendColor, { backgroundColor: theme.primary }]}
          />
          <Text style={styles.legendText}>Đã đo</Text>
        </View>

        {sensorHistory.optimalMin !== undefined &&
          sensorHistory.optimalMax !== undefined && (
            <View style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: theme.success }]}
              />
              <Text style={styles.legendText}>
                Phạm vi tối ưu ({sensorHistory.optimalMin} -{" "}
                {sensorHistory.optimalMax}
                {unitText})
              </Text>
            </View>
          )}
      </View>
    );
  };

  // If no data available
  if (
    !sensorHistory ||
    !sensorHistory.readings ||
    sensorHistory.readings.length === 0
  ) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{typeName}</Text>
          <Text style={styles.noDataText}>Không có dữ liệu</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{typeName}</Text>
      </View>

      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={SCREEN_WIDTH - 48}
          height={180}
          chartConfig={{
            backgroundColor: theme.card,
            backgroundGradientFrom: theme.card,
            backgroundGradientTo: theme.card,
            decimalPlaces: 1,
            color: (opacity = 1) => theme.textSecondary,
            labelColor: (opacity = 1) => theme.textSecondary,
            propsForDots: {
              r: "4",
              strokeWidth: "1",
              stroke: theme.card,
            },
            propsForBackgroundLines: {
              stroke: theme.borderLight,
              strokeDasharray: "",
            },
            fillShadowGradient: theme.primary,
            fillShadowGradientOpacity: 0.2,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={styles.chart}
          withShadow={false}
          withInnerLines={true}
          withOuterLines={true}
          withHorizontalLabels={true}
          withVerticalLabels={true}
          yAxisSuffix={unitText}
          yAxisInterval={1}
          yAxisLabel=""
          verticalLabelRotation={30}
          segments={4}
          fromZero={valueRange.min <= 5}
          formatYLabel={(value) => `${parseFloat(value).toFixed(1)}`}
          yLabelsOffset={12}
        />
      </View>

      {renderLegend()}

      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Trung bình</Text>
          <Text style={styles.summaryValue}>
            {(
              sensorHistory.readings.reduce((sum, r) => sum + r.value, 0) /
              sensorHistory.readings.length
            ).toFixed(1)}
            {unitText}
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Thấp nhất</Text>
          <Text style={styles.summaryValue}>
            {Math.min(...sensorHistory.readings.map((r) => r.value)).toFixed(1)}
            {unitText}
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Cao nhất</Text>
          <Text style={styles.summaryValue}>
            {Math.max(...sensorHistory.readings.map((r) => r.value)).toFixed(1)}
            {unitText}
          </Text>
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: AppThemeType) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    title: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
    },
    noDataText: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      fontStyle: "italic",
    },
    chartContainer: {
      alignItems: "center",
      marginVertical: 8,
    },
    chart: {
      borderRadius: 16,
      paddingRight: 0,
    },
    legendContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 8,
      marginBottom: 12,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 16,
      marginBottom: 4,
    },
    legendColor: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 4,
    },
    legendText: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
    },
    summaryContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
      paddingTop: 12,
    },
    summaryItem: {
      alignItems: "center",
    },
    summaryLabel: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      marginBottom: 2,
    },
    summaryValue: {
      fontSize: 14,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
    },
  });

export default SensorHistoryChart;
