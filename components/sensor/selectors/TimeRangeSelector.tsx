import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { getEnhancedTheme, TimeRange } from "../utils";

interface TimeRangeSelectorProps {
  selected: TimeRange;
  onChange: (range: TimeRange) => void;
  theme: ReturnType<typeof getEnhancedTheme>;
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  selected,
  onChange,
  theme,
}) => {
  const styles = useMemo(() => createStyles(theme), [theme]);
  
  return (
    <View style={styles.timeRangeSelectorContainer}>
      <Text style={styles.selectorLabel}>Khoảng thời gian</Text>
      <View style={styles.timeRangeSelector}>
        {Object.values(TimeRange).map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeOption,
              selected === range && styles.selectedTimeRange,
            ]}
            onPress={() => onChange(range)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.timeRangeLabel,
                selected === range && styles.selectedTimeRangeLabel,
              ]}
            >
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof getEnhancedTheme>) =>
  StyleSheet.create({
    timeRangeSelectorContainer: {
      marginBottom: 24,
    },
    selectorLabel: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    timeRangeSelector: {
      flexDirection: "row",
      backgroundColor: theme.backgroundSecondary || `${theme.primary}0A`,
      borderRadius: 12,
      padding: 4,
    },
    timeRangeOption: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    selectedTimeRange: {
      backgroundColor: theme.primary,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    timeRangeLabel: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.textSecondary,
    },
    selectedTimeRangeLabel: {
      color: theme.buttonText,
      fontFamily: "Inter-Bold",
    },
  }); 