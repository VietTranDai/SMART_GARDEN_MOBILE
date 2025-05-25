import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import useSectionAnimation from "@/hooks/ui/useSectionAnimation";
import ActivityTimeline from "@/components/home/ActivityTimeline";
import useActivityDisplay from "@/hooks/activity/useActivityDisplay";
import {
  ActivityDisplay,
  ScheduleDisplay,
} from "@/types/activities/activity.types";

interface ActivitySectionProps {
  gardenId: number | null;
  recentActivities: ActivityDisplay[];
  upcomingSchedules: ScheduleDisplay[];
}

const ActivitySection = memo(
  ({ gardenId, recentActivities, upcomingSchedules }: ActivitySectionProps) => {
    const theme = useAppTheme();
    const { getAnimatedStyle } = useSectionAnimation("activity", 150);

    // Get formatted activity data
    const { activities, schedules, hasActivities, hasSchedules } =
      useActivityDisplay(gardenId, recentActivities, upcomingSchedules);

    // Styles
    const styles = useMemo(() => makeStyles(theme), [theme]);

    // If no activities or schedules, don't render the section
    if (!hasActivities && !hasSchedules) return null;

    return (
      <Animated.View style={[styles.section, getAnimatedStyle()]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Hoạt động
          </Text>
        </View>
        <ActivityTimeline
          recentActivities={activities}
          upcomingSchedules={schedules}
          selectedGardenId={gardenId}
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
  });

export default ActivitySection;
