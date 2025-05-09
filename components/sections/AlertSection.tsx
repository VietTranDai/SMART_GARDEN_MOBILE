import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import useSectionAnimation from "@/hooks/useSectionAnimation";
import AlertCenter from "@/components/home/AlertCenter";
import useAlertDisplay from "@/hooks/useAlertDisplay";
import { Alert } from "@/types/alerts/alert.types";

interface AlertSectionProps {
  gardenId: number | null;
  gardenAlerts: Record<number, Alert[]>;
  onShowAlertDetails?: (gardenId: number) => void;
}

const AlertSection = memo(
  ({ gardenId, gardenAlerts, onShowAlertDetails }: AlertSectionProps) => {
    const theme = useAppTheme();
    const { getAnimatedStyle } = useSectionAnimation("alerts", 100);

    // Get formatted alert data
    const { alerts, alertCounts, hasAlerts } = useAlertDisplay(
      gardenId,
      gardenAlerts
    );

    // Create a safe object to pass to AlertCenter
    const safeAlerts = useMemo(() => {
      if (!gardenId) return {};

      const result: Record<number, Alert[]> = {};
      result[gardenId] = alerts;
      return result;
    }, [gardenId, alerts]);

    // Styles
    const styles = useMemo(() => makeStyles(theme), [theme]);

    // If no alerts, don't render the section
    if (!hasAlerts) return null;

    return (
      <Animated.View style={[styles.section, getAnimatedStyle()]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Thông báo
            {alertCounts.total > 0 && (
              <Text style={styles.countBadge}> ({alertCounts.total})</Text>
            )}
          </Text>
        </View>
        <AlertCenter
          selectedGardenId={gardenId}
          alerts={safeAlerts}
          onShowDetails={onShowAlertDetails}
        />
      </Animated.View>
    );
  }
);

// Make styles function
const makeStyles = (theme: any) =>
  StyleSheet.create({
    section: {
      marginBottom: 16,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
      paddingHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
    },
    countBadge: {
      fontFamily: "Inter-Medium",
      color: theme.textSecondary,
    },
  });

export default AlertSection;
