import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Sensor } from "@/types/gardens/sensor.types";
import { 
  getEnhancedTheme, 
  getSensorName, 
  getSensorIcon, 
  getSensorStatus, 
  getStatusText,
  getSimpleStatusColor,
  UNIT_DISPLAY,
  getResponsiveSize 
} from "../utils";

interface CurrentReadingCardProps {
  sensor: Sensor;
  theme: ReturnType<typeof getEnhancedTheme>;
}

export const CurrentReadingCard: React.FC<CurrentReadingCardProps> = ({
  sensor,
  theme,
}) => {
  const styles = useMemo(() => createStyles(theme), [theme]);
  
  const status = getSensorStatus(sensor.lastReading ?? 0, sensor.type);
  const statusColor = getSimpleStatusColor(status, theme);
  const iconName = getSensorIcon(sensor.type);
  const unitDisplay = UNIT_DISPLAY[sensor.unit] || "";

  return (
    <View style={[styles.card, styles.currentReadingCard]}>
      <View style={styles.currentReadingTitleContainer}>
        <MaterialCommunityIcons
          name={iconName}
          size={28}
          color={theme.primary}
          style={styles.currentReadingTitleIcon}
        />
        <Text style={[styles.cardTitle, styles.currentReadingCardTitle]}>
          {getSensorName(sensor.type)}
        </Text>
      </View>

      <View style={styles.valueContainer}>
        <Text style={[styles.mainValue, { color: statusColor }]}>
          {(sensor.lastReading ?? 0).toFixed(1)}
        </Text>
        <Text style={[styles.unitText, { color: statusColor }]}>
          {unitDisplay}
        </Text>
      </View>

      <View
        style={[
          styles.statusContainer,
          { backgroundColor: `${statusColor}15` },
        ]}
      >
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusText, { color: statusColor }]}>
          {getStatusText(status)}
        </Text>
      </View>

      <Text style={styles.timestampText}>
        Cập nhật lúc:{" "}
        {new Date(sensor.lastReadingAt ?? Date.now()).toLocaleString("vi-VN")}
      </Text>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof getEnhancedTheme>) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: getResponsiveSize(24, 32, 20),
      marginBottom: 20,
      borderWidth: 0,
      shadowColor: theme.shadows.medium,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
    },
    cardTitle: {
      fontSize: 20,
      fontFamily: "Inter-Bold",
      color: theme.text,
      marginBottom: 24,
      textAlign: "left",
    },
    currentReadingCard: {
      alignItems: "center",
    },
    currentReadingTitleContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
      alignSelf: "stretch",
    },
    currentReadingTitleIcon: {
      marginRight: 10,
    },
    currentReadingCardTitle: {
      marginBottom: 0,
      textAlign: "center",
      flex: 0,
    },
    valueContainer: {
      flexDirection: "row",
      alignItems: "baseline",
      marginBottom: 16,
    },
    mainValue: {
      fontSize: 56,
      fontFamily: "Inter-Bold",
      lineHeight: 64,
    },
    unitText: {
      fontSize: 24,
      fontFamily: "Inter-Medium",
      marginLeft: 8,
      opacity: 0.8,
    },
    statusContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginBottom: 12,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 8,
    },
    statusText: {
      fontSize: 14,
      fontFamily: "Inter-SemiBold",
    },
    timestampText: {
      fontSize: 13,
      color: theme.textTertiary,
      fontFamily: "Inter-Regular",
    },
  }); 