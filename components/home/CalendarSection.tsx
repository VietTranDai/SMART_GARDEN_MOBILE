import React, { memo, useMemo, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import useSectionAnimation from "@/hooks/ui/useSectionAnimation";
import GardenCalendarService from "@/service/api/garden-calendar.service";
import { GardenDisplayDto } from "@/types/gardens/dtos";
import {
  GardenActivityCalendarDto,
  RecentActivityDto,
  UpcomingTaskDto,
  WateringScheduleDto,
  ACTIVITY_TYPE_DISPLAY_MAP,
  TASK_PRIORITY_DISPLAY_MAP,
} from "@/types/gardens/garden-calendar.types";

interface CalendarSectionProps {
  gardenId: number | null;
  selectedGarden?: GardenDisplayDto;
  onShowDetail?: (gardenId: number) => void;
}

const CalendarSection = memo(
  ({ gardenId, selectedGarden, onShowDetail }: CalendarSectionProps) => {
    const theme = useAppTheme();
    const { getAnimatedStyle } = useSectionAnimation("calendar");

    // State management
    const [calendarData, setCalendarData] = useState<GardenActivityCalendarDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Styles
    const styles = useMemo(() => makeStyles(theme), [theme]);

    // Fetch calendar data
    const fetchCalendarData = useCallback(async () => {
      if (!gardenId) return;

      setLoading(true);
      setError(null);

      try {
        const data = await GardenCalendarService.getGardenCalendar(gardenId);
        setCalendarData(data);
      } catch (err) {
        console.error("Error fetching calendar data:", err);
        setError("Không thể tải dữ liệu lịch trình");
      } finally {
        setLoading(false);
      }
    }, [gardenId]);

    // Fetch data when garden changes
    useEffect(() => {
      if (gardenId) {
        fetchCalendarData();
      } else {
        setCalendarData(null);
      }
    }, [gardenId, fetchCalendarData]);

    // Handle detail view
    const handleShowDetail = useCallback(() => {
      if (gardenId && onShowDetail) {
        onShowDetail(gardenId);
      }
    }, [gardenId, onShowDetail]);

    // Render activity item
    const renderActivityItem = useCallback(
      ({ item }: { item: RecentActivityDto }) => {
        const activityInfo = GardenCalendarService.getActivityTypeDisplay(item.activityType);
        const formattedTime = GardenCalendarService.formatActivityTimestamp(
          item.timestamp,
          "relative"
        );

        return (
          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: `${activityInfo.color}15` }]}>
              <Ionicons name={activityInfo.icon as any} size={16} color={activityInfo.color} />
            </View>
            <View style={styles.activityContent}>
              <Text style={[styles.activityName, { color: theme.text }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[styles.activityTime, { color: theme.textSecondary }]}>
                {formattedTime}
              </Text>
              {item.details && (
                <Text style={[styles.activityDetails, { color: theme.textSecondary }]} numberOfLines={2}>
                  {item.details}
                </Text>
              )}
            </View>
            {item.evaluation?.rating && (
              <View style={styles.activityRating}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
                  {item.evaluation.rating}
                </Text>
              </View>
            )}
          </View>
        );
      },
      [theme, styles]
    );

    // Render task item
    const renderTaskItem = useCallback(
      ({ item }: { item: UpcomingTaskDto }) => {
        const priorityInfo = GardenCalendarService.getTaskPriorityDisplay(item.priority);
        const dueDateInfo = GardenCalendarService.formatTaskDueDate(item.dueDate);

        return (
          <View style={styles.taskItem}>
            <View style={[styles.taskPriority, { backgroundColor: priorityInfo.color }]} />
            <View style={styles.taskContent}>
              <Text style={[styles.taskDescription, { color: theme.text }]} numberOfLines={2}>
                {item.description}
              </Text>
              <Text style={[styles.taskType, { color: theme.textSecondary }]}>
                {item.type}
              </Text>
              <View style={styles.taskFooter}>
                <Text style={[
                  styles.taskDueDate,
                  {
                    color: dueDateInfo.isOverdue
                      ? theme.error
                      : dueDateInfo.urgencyLevel === "critical"
                      ? theme.warning
                      : theme.textSecondary,
                  },
                ]}>
                  {dueDateInfo.formatted}
                </Text>
                <Text style={[styles.taskPriorityText, { color: priorityInfo.color }]}>
                  {priorityInfo.label}
                </Text>
              </View>
            </View>
          </View>
        );
      },
      [theme, styles]
    );

    // Render watering schedule item
    const renderWateringItem = useCallback(
      ({ item }: { item: WateringScheduleDto }) => {
        const scheduleTime = GardenCalendarService.formatActivityTimestamp(
          item.scheduledTime,
          "time"
        );

        return (
          <View style={styles.wateringItem}>
            <View style={[styles.wateringIcon, { backgroundColor: `${theme.primary}15` }]}>
              <Ionicons name="water" size={16} color={theme.primary} />
            </View>
            <View style={styles.wateringContent}>
              <Text style={[styles.wateringTime, { color: theme.text }]}>
                {scheduleTime}
              </Text>
              <Text style={[styles.wateringAmount, { color: theme.textSecondary }]}>
                {item.amount}ml - {item.frequency}
              </Text>
            </View>
          </View>
        );
      },
      [theme, styles]
    );

    // Loading state
    if (loading) {
      return (
        <Animated.View style={[styles.section, getAnimatedStyle()]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Lịch trình vườn
            </Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Đang tải lịch trình...
            </Text>
          </View>
        </Animated.View>
      );
    }

    // Error state
    if (error) {
      return (
        <Animated.View style={[styles.section, getAnimatedStyle()]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Lịch trình vườn
            </Text>
          </View>
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={48} color={theme.error} />
            <Text style={[styles.errorText, { color: theme.error }]}>
              {error}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: theme.primary }]}
              onPress={fetchCalendarData}
            >
              <Text style={[styles.retryButtonText, { color: theme.textInverse }]}>
                Thử lại
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      );
    }

    // No data state
    if (!calendarData || !selectedGarden) {
      return (
        <Animated.View style={[styles.section, getAnimatedStyle()]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Lịch trình vườn
            </Text>
          </View>
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Chọn một vườn để xem lịch trình
            </Text>
          </View>
        </Animated.View>
      );
    }

    // Calculate enhanced summary
    const enhancedSummary = GardenCalendarService.calculateCalendarSummary(calendarData);

    return (
      <Animated.View style={[styles.section, getAnimatedStyle()]}>
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.headerLeft}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Lịch trình vườn
            </Text>
            <Text style={[styles.gardenName, { color: theme.textSecondary }]}>
              {selectedGarden.name}
            </Text>
          </View>
          {onShowDetail && (
            <TouchableOpacity
              style={[styles.detailButton, { backgroundColor: `${theme.primary}15` }]}
              onPress={handleShowDetail}
            >
              <Text style={[styles.detailButtonText, { color: theme.primary }]}>
                Chi tiết
              </Text>
              <Ionicons name="chevron-forward" size={16} color={theme.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Summary Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.summaryContainer}
          contentContainerStyle={styles.summaryContent}
        >
          <View style={[styles.summaryCard, { backgroundColor: `${theme.primary}10` }]}>
            <Text style={[styles.summaryValue, { color: theme.primary }]}>
              {calendarData.summary.totalActivitiesThisWeek}
            </Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Hoạt động tuần này
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: `${theme.warning}10` }]}>
            <Text style={[styles.summaryValue, { color: theme.warning }]}>
              {calendarData.summary.upcomingTasksCount}
            </Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Nhiệm vụ sắp tới
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: `${theme.success}10` }]}>
            <Text style={[styles.summaryValue, { color: theme.success }]}>
              {calendarData.summary.completedTasksToday}
            </Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Hoàn thành hôm nay
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: `${theme.error}10` }]}>
            <Text style={[styles.summaryValue, { color: theme.error }]}>
              {enhancedSummary.overdueTasks}
            </Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Quá hạn
            </Text>
          </View>
        </ScrollView>

        {/* Content Sections */}
        <View style={styles.contentContainer}>
          {/* Recent Activities */}
          {calendarData.recentActivities.length > 0 && (
            <View style={styles.subsection}>
              <Text style={[styles.subsectionTitle, { color: theme.text }]}>
                Hoạt động gần đây
              </Text>
              <FlatList
                data={calendarData.recentActivities.slice(0, 3)}
                renderItem={renderActivityItem}
                keyExtractor={(item) => `activity-${item.id}`}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </View>
          )}

          {/* Upcoming Tasks */}
          {calendarData.upcomingTasks.length > 0 && (
            <View style={styles.subsection}>
              <Text style={[styles.subsectionTitle, { color: theme.text }]}>
                Nhiệm vụ sắp tới
              </Text>
              <FlatList
                data={GardenCalendarService.sortTasksByPriority(calendarData.upcomingTasks).slice(0, 3)}
                renderItem={renderTaskItem}
                keyExtractor={(item) => `task-${item.id}`}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </View>
          )}

          {/* Today's Watering Schedule */}
          {calendarData.upcomingWateringSchedules.length > 0 && (
            <View style={styles.subsection}>
              <Text style={[styles.subsectionTitle, { color: theme.text }]}>
                Lịch tưới hôm nay
              </Text>
              <FlatList
                data={GardenCalendarService.getTodaysWateringSchedules(
                  calendarData.upcomingWateringSchedules
                )}
                renderItem={renderWateringItem}
                keyExtractor={(item) => `watering-${item.id}`}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </View>
          )}
        </View>
      </Animated.View>
    );
  }
);

// Styles
const makeStyles = (theme: any) =>
  StyleSheet.create({
    section: {
      backgroundColor: theme.card,
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 12,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    headerLeft: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: "Inter-SemiBold",
    },
    gardenName: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    detailButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
    },
    detailButtonText: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      marginRight: 4,
    },
    summaryContainer: {
      marginBottom: 16,
    },
    summaryContent: {
      paddingRight: 16,
    },
    summaryCard: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginRight: 12,
      minWidth: 100,
      alignItems: "center",
    },
    summaryValue: {
      fontSize: 20,
      fontFamily: "Inter-Bold",
    },
    summaryLabel: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      textAlign: "center",
      marginTop: 4,
    },
    contentContainer: {
      gap: 16,
    },
    subsection: {
      gap: 8,
    },
    subsectionTitle: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
    },
    separator: {
      height: 1,
      backgroundColor: theme.border + "20",
      marginVertical: 8,
    },
    // Activity item styles
    activityItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingVertical: 8,
    },
    activityIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    activityContent: {
      flex: 1,
    },
    activityName: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
    },
    activityTime: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    activityDetails: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      marginTop: 4,
    },
    activityRating: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
    },
    ratingText: {
      fontSize: 12,
      fontFamily: "Inter-Medium",
    },
    // Task item styles
    taskItem: {
      flexDirection: "row",
      paddingVertical: 8,
    },
    taskPriority: {
      width: 4,
      borderRadius: 2,
      marginRight: 12,
    },
    taskContent: {
      flex: 1,
    },
    taskDescription: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
    },
    taskType: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    taskFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 4,
    },
    taskDueDate: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
    },
    taskPriorityText: {
      fontSize: 12,
      fontFamily: "Inter-SemiBold",
    },
    // Watering item styles
    wateringItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
    },
    wateringIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    wateringContent: {
      flex: 1,
    },
    wateringTime: {
      fontSize: 14,
      fontFamily: "Inter-SemiBold",
    },
    wateringAmount: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    // State styles
    loadingContainer: {
      alignItems: "center",
      paddingVertical: 32,
    },
    loadingText: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      marginTop: 8,
    },
    errorContainer: {
      alignItems: "center",
      paddingVertical: 32,
    },
    errorText: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      textAlign: "center",
      marginTop: 8,
      marginBottom: 16,
    },
    retryButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
    },
    retryButtonText: {
      fontSize: 14,
      fontFamily: "Inter-SemiBold",
    },
    emptyContainer: {
      alignItems: "center",
      paddingVertical: 32,
    },
    emptyText: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      textAlign: "center",
      marginTop: 8,
    },
  });

export default CalendarSection; 