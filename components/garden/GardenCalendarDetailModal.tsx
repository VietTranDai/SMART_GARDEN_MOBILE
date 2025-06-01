import React, { memo, useMemo, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Dimensions,
  Image,
  RefreshControl,
  SectionList,
  Alert as RNAlert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import GardenCalendarService from "@/service/api/garden-calendar.service";
import { GardenDisplayDto } from "@/types/gardens/dtos";
import {
  GardenActivityCalendarDto,
  RecentActivityDto,
  UpcomingTaskDto,
  WateringScheduleDto,
  EnvironmentalConditions,
  ActivityEvaluation,
  ACTIVITY_TYPE_DISPLAY_MAP,
  TASK_PRIORITY_DISPLAY_MAP,
} from "@/types/gardens/garden-calendar.types";
import env from "@/config/environment";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface GardenCalendarDetailModalProps {
  visible: boolean;
  onClose: () => void;
  gardenId: number | null;
  selectedGarden?: GardenDisplayDto;
}

interface SectionData {
  title: string;
  data: any[];
  type: 'summary' | 'activities' | 'tasks' | 'watering' | 'plant-info';
  icon: string;
  color: string;
}

const GardenCalendarDetailModal = memo(
  ({ visible, onClose, gardenId, selectedGarden }: GardenCalendarDetailModalProps) => {
    const theme = useAppTheme();
    const styles = useMemo(() => makeStyles(theme), [theme]);

    // State management
    const [calendarData, setCalendarData] = useState<GardenActivityCalendarDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch calendar data
    const fetchCalendarData = useCallback(async (isRefresh = false) => {
      if (!gardenId) return;

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const data = await GardenCalendarService.getGardenCalendar(gardenId);
        setCalendarData(data);
      } catch (err) {
        console.error("Error fetching calendar data:", err);
        setError("Không thể tải dữ liệu lịch trình");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, [gardenId]);

    // Fetch data when modal opens and garden changes
    useEffect(() => {
      if (visible && gardenId) {
        fetchCalendarData();
      }
    }, [visible, gardenId, fetchCalendarData]);

    // Handle refresh
    const handleRefresh = useCallback(() => {
      fetchCalendarData(true);
    }, [fetchCalendarData]);

    // Create sections data
    const sectionsData = useMemo((): SectionData[] => {
      if (!calendarData) return [];

      const sections: SectionData[] = [];

      // Summary section
      const enhancedSummary = GardenCalendarService.calculateCalendarSummary(calendarData);
      sections.push({
        title: "Tổng quan",
        data: [enhancedSummary],
        type: 'summary',
        icon: 'analytics',
        color: theme.primary,
      });

      // Plant info section
      if (calendarData.plantName) {
        sections.push({
          title: "Thông tin cây trồng",
          data: [calendarData],
          type: 'plant-info',
          icon: 'leaf',
          color: theme.success,
        });
      }

      // Recent activities section
      if (calendarData.recentActivities.length > 0) {
        sections.push({
          title: `Hoạt động gần đây (${calendarData.recentActivities.length})`,
          data: calendarData.recentActivities,
          type: 'activities',
          icon: 'time',
          color: '#FF6B6B',
        });
      }

      // Upcoming tasks section
      if (calendarData.upcomingTasks.length > 0) {
        const sortedTasks = GardenCalendarService.sortTasksByPriority(calendarData.upcomingTasks);
        sections.push({
          title: `Nhiệm vụ sắp tới (${calendarData.upcomingTasks.length})`,
          data: sortedTasks,
          type: 'tasks',
          icon: 'list',
          color: '#4ECDC4',
        });
      }

      // Watering schedules section
      if (calendarData.upcomingWateringSchedules.length > 0) {
        sections.push({
          title: `Lịch tưới nước (${calendarData.upcomingWateringSchedules.length})`,
          data: calendarData.upcomingWateringSchedules,
          type: 'watering',
          icon: 'water',
          color: '#45B7D1',
        });
      }

      return sections;
    }, [calendarData, theme]);

    // Render summary card
    const renderSummaryCard = useCallback((data: any) => {
      const summaryItems = [
        {
          label: "Hoạt động tuần này",
          value: data.totalActivitiesThisWeek,
          color: theme.primary,
          icon: "calendar",
        },
        {
          label: "Nhiệm vụ sắp tới",
          value: data.upcomingTasksCount,
          color: theme.warning,
          icon: "list",
        },
        {
          label: "Hoàn thành hôm nay",
          value: data.completedTasksToday,
          color: theme.success,
          icon: "checkmark-circle",
        },
        {
          label: "Quá hạn",
          value: data.overdueTasks,
          color: theme.error,
          icon: "alert-circle",
        },
        {
          label: "Hôm nay cần làm",
          value: data.todaysTasks,
          color: '#FF9500',
          icon: "today",
        },
        {
          label: "Lịch tưới sắp tới",
          value: data.upcomingWatering,
          color: '#007AFF',
          icon: "water",
        },
      ];

      return (
        <View style={styles.summaryGrid}>
          {summaryItems.map((item, index) => (
            <View key={index} style={[styles.summaryItem, { backgroundColor: `${item.color}10` }]}>
              <View style={[styles.summaryIconContainer, { backgroundColor: `${item.color}20` }]}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
              </View>
              <Text style={[styles.summaryValue, { color: item.color }]}>
                {item.value}
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      );
    }, [theme, styles]);

    // Render plant info
    const renderPlantInfo = useCallback((data: GardenActivityCalendarDto) => {
      return (
        <View style={styles.plantInfoContainer}>
          {data.gardenProfilePicture && (
            <Image
              source={{ uri: `${env.apiUrl}${ data.gardenProfilePicture}` }}
              style={styles.plantImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.plantDetails}>
            <View style={styles.plantRow}>
              <Ionicons name="leaf" size={20} color={theme.success} />
              <Text style={[styles.plantLabel, { color: theme.textSecondary }]}>Cây trồng:</Text>
              <Text style={[styles.plantValue, { color: theme.text }]}>{data.plantName}</Text>
            </View>
            {data.plantGrowStage && (
              <View style={styles.plantRow}>
                <MaterialCommunityIcons name="sprout" size={20} color={theme.primary} />
                <Text style={[styles.plantLabel, { color: theme.textSecondary }]}>Giai đoạn:</Text>
                <Text style={[styles.plantValue, { color: theme.text }]}>{data.plantGrowStage}</Text>
              </View>
            )}
            <View style={styles.plantRow}>
              <Ionicons name="home" size={20} color={theme.warning} />
              <Text style={[styles.plantLabel, { color: theme.textSecondary }]}>Vườn:</Text>
              <Text style={[styles.plantValue, { color: theme.text }]}>{data.gardenName}</Text>
            </View>
          </View>
        </View>
      );
    }, [theme, styles]);

    // Render activity item with full details
    const renderActivityItem = useCallback((activity: RecentActivityDto) => {
      const activityInfo = GardenCalendarService.getActivityTypeDisplay(activity.activityType);
      const formattedTime = GardenCalendarService.formatActivityTimestamp(activity.timestamp, "full");

      return (
        <View style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <View style={[styles.activityIcon, { backgroundColor: `${activityInfo.color}15` }]}>
              <Ionicons name={activityInfo.icon as any} size={20} color={activityInfo.color} />
            </View>
            <View style={styles.activityHeaderText}>
              <Text style={[styles.activityName, { color: theme.text }]}>{activity.name}</Text>
              <Text style={[styles.activityTime, { color: theme.textSecondary }]}>{formattedTime}</Text>
            </View>
            {activity.evaluation?.rating && (
              <View style={styles.activityRating}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
                  {activity.evaluation.rating}/5
                </Text>
              </View>
            )}
          </View>

          {activity.details && (
            <Text style={[styles.activityDetails, { color: theme.text }]}>{activity.details}</Text>
          )}

          {activity.notes && (
            <View style={styles.notesContainer}>
              <Text style={[styles.notesLabel, { color: theme.textSecondary }]}>Ghi chú:</Text>
              <Text style={[styles.notesText, { color: theme.text }]}>{activity.notes}</Text>
            </View>
          )}

          {activity.environmentalConditions && (
            <View style={styles.environmentalContainer}>
              <Text style={[styles.environmentalTitle, { color: theme.textSecondary }]}>
                Điều kiện môi trường:
              </Text>
              <View style={styles.environmentalGrid}>
                {activity.environmentalConditions.temperature && (
                  <View style={styles.environmentalItem}>
                    <Ionicons name="thermometer" size={16} color="#FF6B6B" />
                    <Text style={[styles.environmentalValue, { color: theme.text }]}>
                      {activity.environmentalConditions.temperature}°C
                    </Text>
                  </View>
                )}
                {activity.environmentalConditions.humidity && (
                  <View style={styles.environmentalItem}>
                    <Ionicons name="water" size={16} color="#4ECDC4" />
                    <Text style={[styles.environmentalValue, { color: theme.text }]}>
                      {activity.environmentalConditions.humidity}%
                    </Text>
                  </View>
                )}
                {activity.environmentalConditions.soilMoisture && (
                  <View style={styles.environmentalItem}>
                    <MaterialCommunityIcons name="water-percent" size={16} color="#8B4513" />
                    <Text style={[styles.environmentalValue, { color: theme.text }]}>
                      {activity.environmentalConditions.soilMoisture}%
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {activity.evaluation && (
            <View style={styles.evaluationContainer}>
              <Text style={[styles.evaluationTitle, { color: theme.textSecondary }]}>Đánh giá:</Text>
              {activity.evaluation.outcome && (
                <Text style={[styles.evaluationOutcome, { color: theme.success }]}>
                  Kết quả: {activity.evaluation.outcome}
                </Text>
              )}
              {activity.evaluation.comments && (
                <Text style={[styles.evaluationComments, { color: theme.text }]}>
                  {activity.evaluation.comments}
                </Text>
              )}
            </View>
          )}

          {activity.photos && activity.photos.length > 0 && (
            <View style={styles.photosContainer}>
              <Text style={[styles.photosTitle, { color: theme.textSecondary }]}>Hình ảnh:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {activity.photos.map((photo, index) => (
                  <View key={index} style={styles.photoItem}>
                    <Image source={{ uri: photo.url }} style={styles.activityPhoto} />
                    {photo.aiFeedback && (
                      <Text style={[styles.photoFeedback, { color: theme.textSecondary }]}>
                        AI: {photo.confidence}% - {photo.aiFeedback}
                      </Text>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      );
    }, [theme, styles]);

    // Render task item with full details
    const renderTaskItem = useCallback((task: UpcomingTaskDto) => {
      const priorityInfo = GardenCalendarService.getTaskPriorityDisplay(task.priority);
      const dueDateInfo = GardenCalendarService.formatTaskDueDate(task.dueDate);
      const statusText = GardenCalendarService.getTaskStatusText(task.status);

      return (
        <View style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <View style={[styles.taskPriorityIndicator, { backgroundColor: priorityInfo.color }]} />
            <View style={styles.taskHeaderText}>
              <Text style={[styles.taskDescription, { color: theme.text }]}>{task.description}</Text>
              <View style={styles.taskMeta}>
                <Text style={[styles.taskType, { color: theme.textSecondary }]}>{task.type}</Text>
                <Text style={[styles.taskStatus, { color: theme.primary }]}>• {statusText}</Text>
              </View>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: `${priorityInfo.color}15` }]}>
              <Text style={[styles.priorityText, { color: priorityInfo.color }]}>
                {priorityInfo.label}
              </Text>
            </View>
          </View>

          <View style={styles.taskDetails}>
            <View style={styles.taskDetailRow}>
              <Ionicons name="time" size={16} color={theme.textSecondary} />
              <Text style={[styles.taskDetailLabel, { color: theme.textSecondary }]}>Hạn chót:</Text>
              <Text style={[
                styles.taskDetailValue,
                {
                  color: dueDateInfo.isOverdue
                    ? theme.error
                    : dueDateInfo.urgencyLevel === "critical"
                    ? theme.warning
                    : theme.text,
                },
              ]}>
                {dueDateInfo.formatted}
              </Text>
            </View>

            {task.plantTypeName && (
              <View style={styles.taskDetailRow}>
                <Ionicons name="leaf" size={16} color={theme.success} />
                <Text style={[styles.taskDetailLabel, { color: theme.textSecondary }]}>Loại cây:</Text>
                <Text style={[styles.taskDetailValue, { color: theme.text }]}>{task.plantTypeName}</Text>
              </View>
            )}

            {task.plantStageName && (
              <View style={styles.taskDetailRow}>
                <MaterialCommunityIcons name="sprout" size={16} color={theme.primary} />
                <Text style={[styles.taskDetailLabel, { color: theme.textSecondary }]}>Giai đoạn:</Text>
                <Text style={[styles.taskDetailValue, { color: theme.text }]}>{task.plantStageName}</Text>
              </View>
            )}

            <View style={styles.taskDetailRow}>
              <Ionicons name="hourglass" size={16} color={theme.warning} />
              <Text style={[styles.taskDetailLabel, { color: theme.textSecondary }]}>Thời gian còn lại:</Text>
              <Text style={[styles.taskDetailValue, { color: theme.text }]}>
                {task.timeRemaining.days} ngày {task.timeRemaining.hours} giờ
              </Text>
            </View>
          </View>

          {task.recommendations && (
            <View style={styles.recommendationsContainer}>
              <Text style={[styles.recommendationsTitle, { color: theme.textSecondary }]}>
                Khuyến nghị:
              </Text>
              {task.recommendations.optimalTime && (
                <Text style={[styles.recommendationItem, { color: theme.text }]}>
                  ⏰ Thời gian tối ưu: {task.recommendations.optimalTime}
                </Text>
              )}
              {task.recommendations.weatherConsiderations && (
                <Text style={[styles.recommendationItem, { color: theme.text }]}>
                  🌤️ Điều kiện thời tiết: {task.recommendations.weatherConsiderations}
                </Text>
              )}
              {task.recommendations.tips && (
                <Text style={[styles.recommendationItem, { color: theme.text }]}>
                  💡 Mẹo: {task.recommendations.tips}
                </Text>
              )}
            </View>
          )}
        </View>
      );
    }, [theme, styles]);

    // Render watering schedule item
    const renderWateringItem = useCallback((schedule: WateringScheduleDto) => {
      const scheduleTime = GardenCalendarService.formatActivityTimestamp(schedule.scheduledTime, "full");
      const isCompleted = schedule.isCompleted;
      const isSkipped = schedule.isSkipped;

      return (
        <View style={[
          styles.wateringCard,
          {
            opacity: isCompleted || isSkipped ? 0.6 : 1,
            backgroundColor: isCompleted ? `${theme.success}10` : isSkipped ? `${theme.error}10` : theme.card,
          }
        ]}>
          <View style={styles.wateringHeader}>
            <View style={[styles.wateringIcon, { backgroundColor: `${theme.primary}15` }]}>
              <Ionicons 
                name={isCompleted ? "checkmark-circle" : isSkipped ? "close-circle" : "water"} 
                size={20} 
                color={isCompleted ? theme.success : isSkipped ? theme.error : theme.primary} 
              />
            </View>
            <View style={styles.wateringHeaderText}>
              <Text style={[styles.wateringTime, { color: theme.text }]}>{scheduleTime}</Text>
              <Text style={[styles.wateringStatus, { 
                color: isCompleted ? theme.success : isSkipped ? theme.error : theme.textSecondary 
              }]}>
                {isCompleted ? "Đã hoàn thành" : isSkipped ? "Đã bỏ qua" : "Chưa thực hiện"}
              </Text>
            </View>
            <View style={styles.wateringAmount}>
              <Text style={[styles.wateringAmountText, { color: theme.primary }]}>
                {schedule.amount}ml
              </Text>
            </View>
          </View>

          <View style={styles.wateringDetails}>
            <Text style={[styles.wateringFrequency, { color: theme.textSecondary }]}>
              Tần suất: {schedule.frequency}
            </Text>
            {schedule.notes && (
              <Text style={[styles.wateringNotes, { color: theme.text }]}>
                Ghi chú: {schedule.notes}
              </Text>
            )}
          </View>
        </View>
      );
    }, [theme, styles]);

    // Render section header
    const renderSectionHeader = useCallback(({ section }: { section: SectionData }) => {
      return (
        <View style={[styles.sectionHeader, { backgroundColor: `${section.color}10` }]}>
          <View style={styles.sectionHeaderLeft}>
            <Ionicons name={section.icon as any} size={20} color={section.color} />
            <Text style={[styles.sectionTitle, { color: section.color }]}>{section.title}</Text>
          </View>
        </View>
      );
    }, [styles]);

    // Render section item
    const renderSectionItem = useCallback(({ item, section }: { item: any; section: SectionData }) => {
      switch (section.type) {
        case 'summary':
          return renderSummaryCard(item);
        case 'plant-info':
          return renderPlantInfo(item);
        case 'activities':
          return renderActivityItem(item);
        case 'tasks':
          return renderTaskItem(item);
        case 'watering':
          return renderWateringItem(item);
        default:
          return null;
      }
    }, [renderSummaryCard, renderPlantInfo, renderActivityItem, renderTaskItem, renderWateringItem]);

    if (!visible) return null;

    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: theme.card }]}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                Lịch trình chi tiết
              </Text>
              {selectedGarden && (
                <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                  {selectedGarden.name}
                </Text>
              )}
            </View>
            <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
              <Ionicons name="refresh" size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                Đang tải dữ liệu chi tiết...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="warning" size={48} color={theme.error} />
              <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: theme.primary }]}
                onPress={() => fetchCalendarData()}
              >
                <Text style={[styles.retryButtonText, { color: theme.textInverted }]}>
                  Thử lại
                </Text>
              </TouchableOpacity>
            </View>
          ) : sectionsData.length > 0 ? (
            <SectionList
              sections={sectionsData}
              renderItem={renderSectionItem}
              renderSectionHeader={renderSectionHeader}
              keyExtractor={(item, index) => `section-item-${index}`}
              contentContainerStyle={styles.scrollContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={[theme.primary]}
                  tintColor={theme.primary}
                />
              }
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Không có dữ liệu lịch trình
              </Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    );
  }
);

// Styles
const makeStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border + "20",
    },
    closeButton: {
      padding: 8,
    },
    headerCenter: {
      flex: 1,
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 18,
      fontFamily: "Inter-SemiBold",
    },
    headerSubtitle: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    refreshButton: {
      padding: 8,
    },
    scrollContent: {
      paddingBottom: 20,
    },
    sectionHeader: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginTop: 16,
      marginHorizontal: 16,
      borderRadius: 8,
    },
    sectionHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
      marginLeft: 8,
    },
    // Summary styles
    summaryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: 16,
      gap: 12,
    },
    summaryItem: {
      flex: 1,
      minWidth: (screenWidth - 56) / 2,
      padding: 16,
      borderRadius: 12,
      alignItems: "center",
    },
    summaryIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    summaryValue: {
      fontSize: 24,
      fontFamily: "Inter-Bold",
    },
    summaryLabel: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      textAlign: "center",
      marginTop: 4,
    },
    // Plant info styles
    plantInfoContainer: {
      margin: 16,
      padding: 16,
      backgroundColor: theme.card,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    plantImage: {
      width: "100%",
      height: 150,
      borderRadius: 8,
      marginBottom: 12,
    },
    plantDetails: {
      gap: 8,
    },
    plantRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    plantLabel: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      minWidth: 80,
    },
    plantValue: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      flex: 1,
    },
    // Activity styles
    activityCard: {
      margin: 16,
      padding: 16,
      backgroundColor: theme.card,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    activityHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    activityIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    activityHeaderText: {
      flex: 1,
    },
    activityName: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
    },
    activityTime: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    activityRating: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    ratingText: {
      fontSize: 12,
      fontFamily: "Inter-Medium",
    },
    activityDetails: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      lineHeight: 20,
      marginBottom: 8,
    },
    notesContainer: {
      marginTop: 8,
      padding: 12,
      backgroundColor: theme.background,
      borderRadius: 8,
    },
    notesLabel: {
      fontSize: 12,
      fontFamily: "Inter-Medium",
      marginBottom: 4,
    },
    notesText: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      lineHeight: 18,
    },
    environmentalContainer: {
      marginTop: 12,
    },
    environmentalTitle: {
      fontSize: 12,
      fontFamily: "Inter-Medium",
      marginBottom: 8,
    },
    environmentalGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    environmentalItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      padding: 8,
      backgroundColor: theme.background,
      borderRadius: 6,
    },
    environmentalValue: {
      fontSize: 12,
      fontFamily: "Inter-Medium",
    },
    evaluationContainer: {
      marginTop: 12,
      padding: 12,
      backgroundColor: `${theme.success}10`,
      borderRadius: 8,
    },
    evaluationTitle: {
      fontSize: 12,
      fontFamily: "Inter-Medium",
      marginBottom: 4,
    },
    evaluationOutcome: {
      fontSize: 14,
      fontFamily: "Inter-SemiBold",
      marginBottom: 4,
    },
    evaluationComments: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      lineHeight: 18,
    },
    photosContainer: {
      marginTop: 12,
    },
    photosTitle: {
      fontSize: 12,
      fontFamily: "Inter-Medium",
      marginBottom: 8,
    },
    photoItem: {
      marginRight: 12,
    },
    activityPhoto: {
      width: 100,
      height: 100,
      borderRadius: 8,
    },
    photoFeedback: {
      fontSize: 10,
      fontFamily: "Inter-Regular",
      marginTop: 4,
      width: 100,
    },
    // Task styles
    taskCard: {
      margin: 16,
      padding: 16,
      backgroundColor: theme.card,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    taskHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    taskPriorityIndicator: {
      width: 4,
      height: "100%",
      borderRadius: 2,
      marginRight: 12,
    },
    taskHeaderText: {
      flex: 1,
    },
    taskDescription: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
      lineHeight: 22,
    },
    taskMeta: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
    },
    taskType: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
    },
    taskStatus: {
      fontSize: 12,
      fontFamily: "Inter-Medium",
      marginLeft: 4,
    },
    priorityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    priorityText: {
      fontSize: 12,
      fontFamily: "Inter-SemiBold",
    },
    taskDetails: {
      gap: 8,
    },
    taskDetailRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    taskDetailLabel: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      minWidth: 100,
    },
    taskDetailValue: {
      fontSize: 12,
      fontFamily: "Inter-Medium",
      flex: 1,
    },
    recommendationsContainer: {
      marginTop: 12,
      padding: 12,
      backgroundColor: theme.background,
      borderRadius: 8,
    },
    recommendationsTitle: {
      fontSize: 12,
      fontFamily: "Inter-Medium",
      marginBottom: 8,
    },
    recommendationItem: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      lineHeight: 18,
      marginBottom: 4,
    },
    // Watering styles
    wateringCard: {
      margin: 16,
      padding: 16,
      backgroundColor: theme.card,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    wateringHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    wateringIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    wateringHeaderText: {
      flex: 1,
    },
    wateringTime: {
      fontSize: 14,
      fontFamily: "Inter-SemiBold",
    },
    wateringStatus: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    wateringAmount: {
      alignItems: "center",
    },
    wateringAmountText: {
      fontSize: 16,
      fontFamily: "Inter-Bold",
    },
    wateringDetails: {
      gap: 4,
    },
    wateringFrequency: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
    },
    wateringNotes: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      fontStyle: "italic",
    },
    // State styles
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    loadingText: {
      fontSize: 16,
      fontFamily: "Inter-Regular",
      marginTop: 16,
    },
    errorContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    errorText: {
      fontSize: 16,
      fontFamily: "Inter-Regular",
      textAlign: "center",
      marginTop: 16,
      marginBottom: 20,
    },
    retryButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 24,
    },
    retryButtonText: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    emptyText: {
      fontSize: 16,
      fontFamily: "Inter-Regular",
      textAlign: "center",
      marginTop: 16,
    },
  });

export default GardenCalendarDetailModal; 