import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  FlatList,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { Picker } from '@react-native-picker/picker';
import { ActivityType } from "@/types/activities/activity.types";
import { gardenService } from "@/service/api";
import activityService from "@/service/api/activity.service";
import { Garden } from "@/types";
import { GardenActivityDto, PaginatedGardenActivitiesResultDto, PaginationMeta } from "@/types/activities/dtos";

export default function JournalScreen() {
  const theme = useAppTheme();
  const [selectedGardenId, setSelectedGardenId] = useState<string | undefined>(undefined);
  const [selectedActivityType, setSelectedActivityType] = useState<string | undefined>(undefined);
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [loadingGardens, setLoadingGardens] = useState(true);
  const [gardenFetchError, setGardenFetchError] = useState<string | null>(null);
  
  const [activities, setActivities] = useState<GardenActivityDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activityStats, setActivityStats] = useState({
    total: 0,
    thisMonth: 0,
    thisWeek: 0,
  });

  // Activity type translations
  const activityTypeTranslations: Record<ActivityType, string> = {
    [ActivityType.PLANTING]: "Trồng cây",
    [ActivityType.WATERING]: "Tưới nước",
    [ActivityType.FERTILIZING]: "Bón phân",
    [ActivityType.PRUNING]: "Cắt tỉa",
    [ActivityType.HARVESTING]: "Thu hoạch",
    [ActivityType.PEST_CONTROL]: "Kiểm soát sâu bệnh",
    [ActivityType.SOIL_TESTING]: "Kiểm tra đất",
    [ActivityType.WEEDING]: "Làm cỏ",
    [ActivityType.OTHER]: "Hoạt động khác",
  };
  
  // Fetch gardens for filter
  const fetchUserGardens = useCallback(async () => {
    try {
      setLoadingGardens(true);
      setGardenFetchError(null);
      const userGardens = await gardenService.getGardens();
      setGardens(userGardens || []);
    } catch (err) {
      console.error("Failed to fetch gardens for filter:", err);
      setGardenFetchError("Không thể tải danh sách vườn để lọc.");
    } finally {
      setLoadingGardens(false);
    }
  }, []);

  // Calculate activity stats
  const calculateActivityStats = useCallback((activities: GardenActivityDto[] = [], meta: PaginationMeta | null = null) => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    // Get first day of current week (Sunday)
    const firstDayOfWeek = new Date(now);
    const day = now.getDay();
    const diff = now.getDate() - day;
    firstDayOfWeek.setDate(diff);
    firstDayOfWeek.setHours(0, 0, 0, 0);
    
    const activitiesThisMonth = activities.filter(activity => {
      const activityDate = new Date(activity.timestamp);
      return activityDate.getMonth() === thisMonth && activityDate.getFullYear() === thisYear;
    }).length;
    
    const activitiesThisWeek = activities.filter(activity => {
      const activityDate = new Date(activity.timestamp);
      return activityDate >= firstDayOfWeek;
    }).length;
    
    setActivityStats({
      total: meta?.totalItems || activities.length,
      thisMonth: activitiesThisMonth,
      thisWeek: activitiesThisWeek,
    });
  }, []);

  // Fetch activities
  const fetchActivities = useCallback(async (pageNum = 1, refresh = false) => {
    try {
      setError(null);
      if (pageNum === 1 || refresh) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params: any = {
        page: pageNum,
        limit: 10,
      };
      
      if (selectedGardenId) {
        params.gardenId = parseInt(selectedGardenId);
      }
      
      if (selectedActivityType) {
        params.type = selectedActivityType;
      }

      const response = await activityService.getActivities(params);
      
      const items = response.items || [];
      const meta = response.meta || null;

      if (pageNum === 1 || refresh) {
        setActivities(items);
      } else {
        setActivities(prev => [...prev, ...items]);
      }
      
      setPagination(meta);
      setPage(pageNum);
      
      // Calculate stats based on the fetched activities
      calculateActivityStats(items, meta);
    } catch (err) {
      console.error('Failed to load activities:', err);
      setError('Không thể tải nhật ký hoạt động. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [selectedGardenId, selectedActivityType, calculateActivityStats]);

  useEffect(() => {
    fetchUserGardens();
    fetchActivities(1, true);
  }, [fetchUserGardens, fetchActivities]);

  useFocusEffect(
    useCallback(() => {
      fetchUserGardens();
      fetchActivities(1, true);
    }, [fetchUserGardens, fetchActivities])
  );

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchActivities(1, true);
    setRefreshing(false);
  }, [fetchActivities]);

  // Load more activities
  const loadMoreActivities = useCallback(() => {
    if (!pagination || loadingMore || !activities || activities.length === 0 || 
        (pagination && activities.length >= pagination.totalItems)) {
      return;
    }
    
    const nextPage = page + 1;
    if (nextPage <= pagination.totalPages) {
      setLoadingMore(true);
      fetchActivities(nextPage);
    }
  }, [pagination, loadingMore, activities, page, fetchActivities]);

  // Handle activity press
  const handleActivityPress = useCallback((activity: GardenActivityDto) => {
    // Navigate to activity detail page (to be implemented)
    console.log("Activity pressed:", activity.id);
    // router.push(`/(modules)/journal/${activity.id}`);
  }, []);

  // Format date in Vietnamese
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    const isToday = date.toDateString() === now.toDateString();
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const timeOptions: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    };
    const time = date.toLocaleTimeString('vi-VN', timeOptions);
    
    let dateLabel = '';
    if (isToday) {
      dateLabel = `Hôm nay, ${time}`;
    } else if (isYesterday) {
      dateLabel = `Hôm qua, ${time}`;
    } else {
      const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      };
      dateLabel = `${date.toLocaleDateString('vi-VN', dateOptions)}, ${time}`;
    }
    
    return dateLabel;
  }, []);

  // Find selected garden name
  const selectedGardenName = selectedGardenId 
    ? gardens.find(g => g.id.toString() === selectedGardenId)?.name 
    : undefined;

  // Activity icon based on type
  const getActivityIcon = useCallback((type: string) => {
    switch (type) {
      case ActivityType.WATERING:
        return 'water-outline';
      case ActivityType.FERTILIZING:
        return 'leaf-outline';
      case ActivityType.PRUNING:
        return 'cut-outline';
      case ActivityType.HARVESTING:
        return 'basket-outline';
      case ActivityType.PEST_CONTROL:
        return 'bug-outline';
      case ActivityType.PLANTING:
        return 'trending-up-outline';
      case ActivityType.WEEDING:
        return 'remove-circle-outline';
      case ActivityType.SOIL_TESTING:
        return 'flask-outline';
      default:
        return 'clipboard-outline';
    }
  }, []);

  // Render activity item
  const renderActivityItem = useCallback(({ item }: { item: GardenActivityDto }) => {
    const activityTypeDisplay = activityTypeTranslations[item.activityType as ActivityType] || item.activityType;
    const formattedDate = formatDate(item.timestamp);
    
    return (
      <TouchableOpacity 
        style={styles.activityCard}
        onPress={() => handleActivityPress(item)}
      >
        <View style={styles.activityHeader}>
          <View style={[styles.activityIconContainer, { backgroundColor: theme.primary + '1A' }]}>
            <Ionicons
              name={getActivityIcon(item.activityType)}
              size={22}
              color={theme.primary}
            />
          </View>
          <View style={styles.activityTitleContainer}>
            <Text style={styles.activityTitle}>{item.name}</Text>
            <Text style={styles.activityType}>{activityTypeDisplay}</Text>
          </View>
          <Text style={styles.activityTime}>{formattedDate}</Text>
        </View>
        
        {item.details && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsText}>{item.details}</Text>
          </View>
        )}
        
        <View style={styles.metadataContainer}>
          {item.gardenId && (
            <View style={styles.metadataItem}>
              <Ionicons name="leaf-outline" size={14} color={theme.textSecondary} />
              <Text style={styles.metadataText}>
                Vườn #{item.gardenId}
              </Text>
            </View>
          )}
          
          {item.plantName && (
            <View style={styles.metadataItem}>
              <Ionicons name="flower-outline" size={14} color={theme.textSecondary} />
              <Text style={styles.metadataText}>
                {item.plantName}
              </Text>
            </View>
          )}
          
          {item.plantGrowStage && (
            <View style={styles.metadataItem}>
              <Ionicons name="analytics-outline" size={14} color={theme.textSecondary} />
              <Text style={styles.metadataText}>
                {item.plantGrowStage}
              </Text>
            </View>
          )}
        </View>
        
        {/* Additional data section */}
        {(item.notes || item.reason || 
          item.temperature !== undefined || 
          item.humidity !== undefined ||
          item.soilMoisture !== undefined) && (
          <View style={styles.additionalInfoContainer}>
            {item.notes && (
              <Text style={styles.notesText}>
                <Text style={styles.labelText}>Ghi chú: </Text>
                {item.notes}
              </Text>
            )}
            
            {/* Weather and sensor data in columns */}
            <View style={styles.sensorDataContainer}>
              {item.temperature !== undefined && (
                <View style={styles.sensorItem}>
                  <Ionicons name="thermometer-outline" size={16} color={theme.textSecondary} />
                  <Text style={styles.sensorText}>{item.temperature}°C</Text>
                </View>
              )}
              
              {item.humidity !== undefined && (
                <View style={styles.sensorItem}>
                  <Ionicons name="water-outline" size={16} color={theme.textSecondary} />
                  <Text style={styles.sensorText}>{item.humidity}%</Text>
                </View>
              )}
              
              {item.soilMoisture !== undefined && (
                <View style={styles.sensorItem}>
                  <MaterialCommunityIcons name="water-percent" size={16} color={theme.textSecondary} />
                  <Text style={styles.sensorText}>{item.soilMoisture}%</Text>
                </View>
              )}
              
              {item.lightIntensity !== undefined && (
                <View style={styles.sensorItem}>
                  <Ionicons name="sunny-outline" size={16} color={theme.textSecondary} />
                  <Text style={styles.sensorText}>{item.lightIntensity} lux</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  }, [handleActivityPress, formatDate, activityTypeTranslations, getActivityIcon, theme]);
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    headerSection: {
      backgroundColor: theme.card,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    headerTitle: {
      fontSize: 22,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    summaryStatsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 5,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.backgroundSecondary,
      borderRadius: 8,
      padding: 10,
      marginHorizontal: 4,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    statValue: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      textAlign: 'center',
    },
    filterContainer: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    filterRow: {
      marginBottom: 8,
    },
    pickerLabel: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
      marginBottom: 5,
      flexDirection: 'row',
      alignItems: 'center',
    },
    pickerLabelText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
      marginLeft: 5,
    },
    pickerWrapper: {
      backgroundColor: theme.backgroundSecondary,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden',
    },
    pickerStyle: {
      color: theme.text,
      height: Platform.OS === 'ios' ? 150 : 50, // Taller for iOS
    },
    selectedFiltersContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
    },
    selectedFilterItem: {
      marginTop: 8,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      borderRadius: 8,
      backgroundColor: theme.primary + '15',
      borderLeftWidth: 3,
      borderLeftColor: theme.primary,
      marginRight: 8,
    },
    selectedFilterText: {
      fontSize: 13,
      fontFamily: 'Inter-Medium',
      color: theme.text,
      marginLeft: 6,
      flex: 1,
    },
    clearFilterButton: {
      padding: 6,
    },
    errorText: {
      color: theme.error,
      textAlign: 'center',
      padding: 10,
      fontFamily: 'Inter-Regular',
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      justifyContent: 'center',
    },
    loadingText: {
      marginLeft: 10,
      color: theme.textSecondary,
      fontFamily: 'Inter-Regular',
    },
    contentWrapper: {
      flex: 1,
    },
    activityCard: {
      backgroundColor: theme.card,
      borderRadius: 10,
      padding: 14,
      marginVertical: 6,
      marginHorizontal: 16,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 1,
      borderLeftWidth: 3,
      borderLeftColor: theme.primary,
    },
    activityHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    activityIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    activityTitleContainer: {
      flex: 1,
    },
    activityTitle: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    activityType: {
      fontSize: 13,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
    },
    activityTime: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.textTertiary,
      marginLeft: 5,
    },
    detailsContainer: {
      marginTop: 10,
      marginBottom: 8,
      paddingHorizontal: 2,
    },
    detailsText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      lineHeight: 20,
    },
    metadataContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginVertical: 8,
    },
    metadataItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.backgroundSecondary + '40',
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 4,
      marginRight: 6,
      marginBottom: 4,
    },
    metadataText: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginLeft: 4,
    },
    additionalInfoContainer: {
      marginTop: 6,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
    },
    notesText: {
      fontSize: 13,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginBottom: 8,
    },
    labelText: {
      fontFamily: 'Inter-Medium',
      color: theme.text,
    },
    sensorDataContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    sensorItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.backgroundSecondary + '30',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      marginRight: 8,
      marginBottom: 4,
    },
    sensorText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
      marginLeft: 4,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    emptyTitle: {
      fontSize: 20,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 15,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      textAlign: 'center',
      maxWidth: 300,
      lineHeight: 22,
    },
    fab: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.5,
    },
    fabIcon: {
      color: '#ffffff',
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Section with Activity Stats */}
      <View style={styles.headerSection}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Nhật ký hoạt động</Text>
          {loading && !refreshing && (
            <ActivityIndicator size="small" color={theme.primary} style={{ width: 18, height: 18 }} />
          )}
        </View>

        <View style={styles.summaryStatsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.backgroundSecondary }]}>
            <Text style={styles.statValue}>{activityStats.total}</Text>
            <Text style={styles.statLabel}>Tổng cộng</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.backgroundSecondary }]}>
            <Text style={styles.statValue}>{activityStats.thisMonth}</Text>
            <Text style={styles.statLabel}>Tháng này</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.backgroundSecondary }]}>
            <Text style={styles.statValue}>{activityStats.thisWeek}</Text>
            <Text style={styles.statLabel}>Tuần này</Text>
          </View>
        </View>
      </View>

      {/* Filter Section */}
      <View style={styles.filterContainer}>
        {/* Garden filter */}
        <View style={styles.filterRow}>
          <View style={styles.pickerLabel}>
            <Ionicons name="leaf-outline" size={16} color={theme.textSecondary} />
            <Text style={styles.pickerLabelText}>Lọc theo vườn</Text>
          </View>
          
          {loadingGardens ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={styles.loadingText}>Đang tải danh sách vườn...</Text>
            </View>
          ) : gardenFetchError ? (
            <Text style={styles.errorText}>{gardenFetchError}</Text>
          ) : (
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedGardenId}
                onValueChange={(itemValue) => setSelectedGardenId(itemValue?.toString())}
                style={styles.pickerStyle}
                dropdownIconColor={theme.text}
              >
                <Picker.Item label="Tất cả các vườn" value={undefined} />
                {gardens.map((garden) => (
                  <Picker.Item 
                    key={garden.id} 
                    label={garden.name || `Vườn #${garden.id}`} 
                    value={garden.id.toString()} 
                  />
                ))}
              </Picker>
            </View>
          )}
        </View>
        
        {/* Activity type filter */}
        <View style={styles.filterRow}>
          <View style={styles.pickerLabel}>
            <Ionicons name="options-outline" size={16} color={theme.textSecondary} />
            <Text style={styles.pickerLabelText}>Lọc theo loại hoạt động</Text>
          </View>
          
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedActivityType}
              onValueChange={(itemValue) => setSelectedActivityType(itemValue?.toString())}
              style={styles.pickerStyle}
              dropdownIconColor={theme.text}
            >
              <Picker.Item label="Tất cả các hoạt động" value={undefined} />
              {Object.entries(activityTypeTranslations).map(([type, translation]) => (
                <Picker.Item key={type} label={translation} value={type} />
              ))}
            </Picker>
          </View>
        </View>
        
        {/* Show selected filters */}
        <View style={styles.selectedFiltersContainer}>
          {selectedGardenId && (
            <View style={styles.selectedFilterItem}>
              <Ionicons name="leaf-outline" size={16} color={theme.primary} />
              <Text style={styles.selectedFilterText} numberOfLines={1}>
                {selectedGardenName || `Vườn #${selectedGardenId}`}
              </Text>
              <TouchableOpacity 
                style={styles.clearFilterButton}
                onPress={() => setSelectedGardenId(undefined)}
              >
                <Ionicons name="close-circle" size={20} color={theme.primary} />
              </TouchableOpacity>
            </View>
          )}
          
          {selectedActivityType && (
            <View style={styles.selectedFilterItem}>
              <Ionicons name="options-outline" size={16} color={theme.primary} />
              <Text style={styles.selectedFilterText} numberOfLines={1}>
                {activityTypeTranslations[selectedActivityType as ActivityType] || selectedActivityType}
              </Text>
              <TouchableOpacity 
                style={styles.clearFilterButton}
                onPress={() => setSelectedActivityType(undefined)}
              >
                <Ionicons name="close-circle" size={20} color={theme.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Activity List */}
      <View style={styles.contentWrapper}>
        {loading && !refreshing && activities.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={styles.loadingText}>Đang tải nhật ký hoạt động...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={theme.error} />
            <Text style={[styles.emptyText, { color: theme.error }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.statCard, { marginTop: 16, backgroundColor: theme.primary }]}
              onPress={() => fetchActivities(1, true)}
            >
              <Text style={[styles.statLabel, { color: '#fff' }]}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : activities.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="notebook-outline" size={64} color={theme.textTertiary} />
            <Text style={styles.emptyTitle}>Không có hoạt động nào</Text>
            <Text style={styles.emptyText}>
              {(selectedGardenId || selectedActivityType) ? 
                'Không tìm thấy hoạt động nào phù hợp với bộ lọc hiện tại.' : 
                'Chưa có hoạt động nào được ghi nhận. Hãy thêm hoạt động mới để theo dõi công việc vườn của bạn.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={activities}
            renderItem={renderActivityItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingVertical: 10 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.primary]}
                tintColor={theme.primary}
              />
            }
            onEndReached={loadMoreActivities}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator
                  size="small"
                  color={theme.primary}
                  style={{ marginVertical: 20 }}
                />
              ) : null
            }
          />
        )}
      </View>

      {/* Floating Action Button for creating new activity */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => {
          // Navigate to create activity (to be implemented)
          // router.push('/(modules)/journal/create');
        }}
      >
        <Ionicons name="add" size={24} style={styles.fabIcon} />
      </TouchableOpacity>
    </SafeAreaView>
  );
} 