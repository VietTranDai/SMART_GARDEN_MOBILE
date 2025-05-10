import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  FlatList,
} from "react-native";
import { Stack, useRouter, useGlobalSearchParams } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { taskService, gardenService, wateringService } from "@/service/api";
import { Garden, WateringSchedule, TaskStatus } from "@/types";

// Comment out DateTimePicker import until package is properly installed
// import DateTimePicker from "@react-native-community/datetimepicker";

export default function WateringScheduleScreen() {
  const router = useRouter();
  const { id } = useGlobalSearchParams(); // Garden ID
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [garden, setGarden] = useState<Garden | null>(null);
  const [schedules, setSchedules] = useState<WateringSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New schedule state
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [autoSchedule, setAutoSchedule] = useState(true);
  const [scheduleDate, setScheduleDate] = useState(new Date());
  const [scheduleTime, setScheduleTime] = useState(new Date());
  const [waterAmount, setWaterAmount] = useState("0.5");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const fetchData = async () => {
    if (!id) return;

    try {
      setError(null);
      const gardenId = typeof id === "string" ? id : id.toString();

      // Fetch garden details
      const gardenData = await gardenService.getGardenById(gardenId);
      setGarden(gardenData);

      // Fetch watering schedules
      const schedulesData = await wateringService.getGardenWateringSchedules(
        gardenId
      );
      setSchedules(schedulesData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleCreateSchedule = async () => {
    if (!id) return;

    setIsCreating(true);

    // Combine date and time for scheduled time
    const scheduledAt = new Date(scheduleDate);
    scheduledAt.setHours(scheduleTime.getHours(), scheduleTime.getMinutes());

    // Validate
    if (scheduledAt < new Date()) {
      Alert.alert("Invalid Date", "Scheduled time must be in the future");
      setIsCreating(false);
      return;
    }

    if (isNaN(parseFloat(waterAmount)) || parseFloat(waterAmount) <= 0) {
      Alert.alert("Invalid Amount", "Water amount must be greater than 0");
      setIsCreating(false);
      return;
    }

    try {
      const gardenId = typeof id === "string" ? id : id.toString();

      const newSchedule = await wateringService.createWateringSchedule(
        gardenId,
        {
          scheduledAt: scheduledAt.toISOString(),
          amount: parseFloat(waterAmount),
        }
      );

      if (newSchedule) {
        setSchedules((prev) => [newSchedule, ...prev]);
      }
      setShowScheduleForm(false);
      setScheduleDate(new Date());
      setScheduleTime(new Date());
      setWaterAmount("0.5");

      Alert.alert(
        "Schedule Created",
        "Your watering schedule has been created successfully!"
      );
    } catch (err) {
      console.error("Failed to create schedule:", err);
      Alert.alert(
        "Error",
        "Failed to create watering schedule. Please try again."
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateAutomaticSchedule = async () => {
    if (!id) return;

    setIsCreating(true);

    try {
      const gardenId = typeof id === "string" ? id : id.toString();

      const newSchedule = await wateringService.generateAutomaticSchedule(
        gardenId
      );

      if (newSchedule) {
        setSchedules((prev) => [newSchedule, ...prev]);
      }

      Alert.alert(
        "Schedule Created",
        "Automatic watering schedule has been created based on your garden's needs."
      );
    } catch (err) {
      console.error("Failed to create automatic schedule:", err);
      Alert.alert(
        "Error",
        "Failed to create automatic watering schedule. Please try again."
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this watering schedule?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await wateringService.deleteWateringSchedule(scheduleId);
              setSchedules((prev) =>
                prev.filter((schedule) => schedule.id !== scheduleId)
              );
            } catch (err) {
              console.error("Failed to delete schedule:", err);
              Alert.alert(
                "Error",
                "Failed to delete watering schedule. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const handleChangeStatus = async (
    scheduleId: number,
    newStatus: TaskStatus
  ) => {
    try {
      if (newStatus === TaskStatus.COMPLETED) {
        await wateringService.completeWateringSchedule(scheduleId);
      } else if (newStatus === TaskStatus.SKIPPED) {
        await wateringService.skipWateringSchedule(scheduleId);
      }

      // Update local state
      setSchedules((prev) =>
        prev.map((schedule) =>
          schedule.id === scheduleId
            ? { ...schedule, status: newStatus }
            : schedule
        )
      );
    } catch (err) {
      console.error(`Failed to update schedule ${scheduleId} status:`, err);
      Alert.alert(
        "Error",
        "Failed to update watering schedule status. Please try again."
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return theme.success;
      case "SKIPPED":
        return theme.textTertiary;
      case "PENDING":
      default:
        return theme.primary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Completed";
      case "SKIPPED":
        return "Skipped";
      case "PENDING":
      default:
        return "Pending";
    }
  };

  // Placeholder functions for DateTimePicker until it's installed and used
  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || scheduleDate;
    setShowDatePicker(Platform.OS === "ios"); // Keep open on iOS
    setScheduleDate(currentDate);
  };

  const onChangeTime = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || scheduleTime;
    setShowTimePicker(Platform.OS === "ios"); // Keep open on iOS
    setScheduleTime(currentTime);
  };

  const renderScheduleItem = ({ item }: { item: WateringSchedule }) => {
    const isUpcoming = new Date(item.scheduledAt) > new Date();

    return (
      <View style={styles.scheduleCard}>
        <View style={styles.scheduleCardLeft}>
          <View style={styles.dateTimeContainer}>
            <Text style={styles.dateText}>{formatDate(item.scheduledAt)}</Text>
            <Text style={styles.timeText}>{formatTime(item.scheduledAt)}</Text>
          </View>
          <View style={styles.amountContainer}>
            <MaterialCommunityIcons
              name="water-outline"
              size={18}
              color={theme.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.amountText}>{item.amount} L</Text>
          </View>
        </View>

        <View style={styles.scheduleCardRight}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + "20" }, // Light background
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {getStatusText(item.status)}
            </Text>
          </View>
          {item.status === "PENDING" && isUpcoming && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  handleChangeStatus(item.id, TaskStatus.COMPLETED)
                }
              >
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={theme.success}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleChangeStatus(item.id, TaskStatus.SKIPPED)}
              >
                <Ionicons name="close-circle" size={22} color={theme.error} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteSchedule(item.id)}
              >
                <Ionicons
                  name="trash-bin"
                  size={20}
                  color={theme.textTertiary}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading schedule...
        </Text>
      </View>
    );
  }

  if (!garden) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="alert-circle-outline" size={40} color={theme.error} />
        <Text style={[styles.errorText, { color: theme.text }]}>
          {error || "Could not load garden data."}
        </Text>
      </View>
    );
  }

  const pendingSchedules = schedules.filter((s) => s.status === "PENDING");
  const pastSchedules = schedules.filter((s) => s.status !== "PENDING");

  return (
    <>
      <Stack.Screen
        options={{
          title: `Watering for ${garden.name}`,
        }}
      />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Add Schedule</Text>
            <TouchableOpacity
              onPress={() => setShowScheduleForm(!showScheduleForm)}
            >
              <Ionicons
                name={showScheduleForm ? "chevron-up" : "chevron-down"}
                size={24}
                color={theme.primary}
              />
            </TouchableOpacity>
          </View>

          {showScheduleForm && (
            <View style={styles.formContainer}>
              <TouchableOpacity
                style={styles.smartScheduleButton}
                onPress={handleCreateAutomaticSchedule}
                disabled={isCreating}
              >
                <Ionicons name="sparkles" size={20} color={theme.card} />
                <Text style={styles.smartScheduleButtonText}>
                  Create Smart Schedule (Recommended)
                </Text>
                {isCreating && <ActivityIndicator color={theme.card} />}
              </TouchableOpacity>

              <Text style={styles.orText}>Or Create Manually</Text>

              <View style={styles.formRow}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.datePickerText}>
                    {scheduleDate.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              </View>
              {/* TODO: Replace with actual DateTimePicker */}
              {showDatePicker && (
                <Text>DateTimePicker for Date would go here</Text>
                /* <DateTimePicker
                  testID="datePicker"
                  value={scheduleDate}
                  mode={"date"}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onChangeDate}
                /> */
              )}

              <View style={styles.formRow}>
                <Text style={styles.label}>Time</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                  <Text style={styles.datePickerText}>
                    {scheduleTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </TouchableOpacity>
              </View>
              {/* TODO: Replace with actual DateTimePicker */}
              {showTimePicker && (
                <Text>DateTimePicker for Time would go here</Text>
                /* <DateTimePicker
                  testID="timePicker"
                  value={scheduleTime}
                  mode={"time"}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  is24Hour={true} // Adjust as needed
                  onChange={onChangeTime}
                /> */
              )}

              <View style={styles.formRow}>
                <Text style={styles.label}>Amount (Liters)</Text>
                <TextInput
                  style={styles.input}
                  value={waterAmount}
                  onChangeText={setWaterAmount}
                  keyboardType="numeric"
                  placeholder="e.g., 0.5"
                />
              </View>

              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateSchedule}
                disabled={isCreating}
              >
                <Text style={styles.createButtonText}>Create Schedule</Text>
                {isCreating && (
                  <ActivityIndicator
                    color={theme.card}
                    style={{ marginLeft: 10 }}
                  />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Schedules</Text>
          {pendingSchedules.length > 0 ? (
            <FlatList
              data={pendingSchedules.sort(
                (a, b) =>
                  new Date(a.scheduledAt).getTime() -
                  new Date(b.scheduledAt).getTime()
              )}
              renderItem={renderScheduleItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false} // Disable scrolling within ScrollView
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          ) : (
            <Text style={styles.noSchedulesText}>
              No upcoming schedules found.
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Past Schedules</Text>
          {pastSchedules.length > 0 ? (
            <FlatList
              data={pastSchedules.sort(
                (a, b) =>
                  new Date(b.scheduledAt).getTime() -
                  new Date(a.scheduledAt).getTime()
              )}
              renderItem={renderScheduleItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false} // Disable scrolling within ScrollView
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          ) : (
            <Text style={styles.noSchedulesText}>No past schedules found.</Text>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundAlt,
    },
    centered: {
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: theme.textSecondary,
    },
    errorText: {
      marginTop: 10,
      fontSize: 16,
      color: theme.text,
      textAlign: "center",
      paddingHorizontal: 20,
    },
    section: {
      backgroundColor: theme.background,
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginBottom: 8,
    },
    sectionHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10, // Add margin if form is hidden
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: "Inter-Bold",
      color: theme.text,
      marginBottom: 16,
    },
    formContainer: {
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
      marginTop: 10,
    },
    smartScheduleButton: {
      backgroundColor: theme.primary,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      marginBottom: 15,
    },
    smartScheduleButtonText: {
      color: theme.card,
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
      marginLeft: 8,
    },
    orText: {
      textAlign: "center",
      color: theme.textSecondary,
      marginVertical: 15,
      fontFamily: "Inter-Medium",
      fontSize: 14,
    },
    formRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
    },
    label: {
      fontSize: 16,
      color: theme.textSecondary,
      fontFamily: "Inter-Regular",
    },
    input: {
      backgroundColor: theme.backgroundAlt,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 12,
      fontSize: 16,
      color: theme.text,
      width: "50%",
    },
    datePickerText: {
      fontSize: 16,
      color: theme.primary,
      fontFamily: "Inter-Medium",
      paddingVertical: 10,
    },
    createButton: {
      backgroundColor: theme.success,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      marginTop: 10,
    },
    createButtonText: {
      color: theme.card,
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
    },
    scheduleCard: {
      backgroundColor: theme.card,
      borderRadius: 10,
      padding: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      elevation: 1,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 1,
    },
    scheduleCardLeft: {
      flex: 1,
      marginRight: 12,
    },
    scheduleCardRight: {
      alignItems: "flex-end",
    },
    dateTimeContainer: {
      marginBottom: 8,
    },
    dateText: {
      fontSize: 15,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
    },
    timeText: {
      fontSize: 14,
      color: theme.textSecondary,
      fontFamily: "Inter-Regular",
    },
    amountContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
    },
    amountText: {
      fontSize: 14,
      color: theme.textSecondary,
      fontFamily: "Inter-Regular",
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 15,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    statusText: {
      fontSize: 13,
      fontFamily: "Inter-Medium",
    },
    actionButtonsContainer: {
      flexDirection: "row",
      marginTop: 4, // Add some space above buttons
    },
    actionButton: {
      marginLeft: 15, // Space between buttons
      padding: 4, // Make tap target slightly larger
    },
    noSchedulesText: {
      textAlign: "center",
      fontSize: 15,
      color: theme.textSecondary,
      marginTop: 20,
      paddingBottom: 20,
      fontFamily: "Inter-Regular",
    },
    separator: {
      height: 10,
      backgroundColor: theme.backgroundAlt,
    },
  });
