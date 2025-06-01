import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  SectionList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

// Import custom hooks
import { useJournalData } from "../../../components/journal/hooks/useJournalData";
import { useJournalStats } from "../../../components/journal/hooks/useJournalStats";

// Import components
import { JournalHeader } from "../../../components/journal/components/JournalHeader";
import { JournalDetailedStats } from "../../../components/journal/components/JournalDetailedStats";
import { JournalFilters } from "../../../components/journal/components/JournalFilters";
import { JournalActivityItem } from "../../../components/journal/components/JournalActivityItem";
import { JournalEmptyState } from "../../../components/journal/components/JournalEmptyState";
import { ActivityAnalyticsModal } from "../../../components/journal/components/ActivityAnalyticsModal";

// Import utils and types
import { groupActivitiesByDate, filterActivities } from "../../../components/journal/utils/journalUtils";
import { JournalState, ActivitySection } from "../../../components/journal/types";
import { createJournalStyles } from "../../../components/journal/styles/journalStyles";
import { GardenActivityDto } from "@/types/activities/dtos";
import activityService from "@/service/api/activity.service";

export default function JournalScreen() {
  const theme = useAppTheme();
  const styles = createJournalStyles(theme);

  // UI State
  const [uiState, setUiState] = useState<JournalState>({
    searchQuery: '',
    isSearchActive: false,
    isStatsExpanded: false,
    selectedDateRange: '30days',
  });

  // Analytics Modal State
  const [analyticsModalVisible, setAnalyticsModalVisible] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Custom hooks
  const {
    data,
    stats,
    pagination,
    fetchUserGardens,
    fetchActivities,
    fetchDashboardStats,
    onRefresh,
    loadMoreActivities,
    updateTotalStats,
  } = useJournalData();

  const {
    detailedStats,
    statsLoading,
    statsError,
    fetchDetailedStats,
  } = useJournalStats();

  // Derived state
  const currentFilters = {
    selectedGardenId: uiState.selectedGardenId,
    selectedActivityType: uiState.selectedActivityType,
  };

  const filteredActivities = filterActivities(data.activities, uiState.searchQuery);
  const sections = groupActivitiesByDate(filteredActivities);
  const hasActiveFilters = !!(uiState.selectedGardenId || uiState.selectedActivityType);

  // Event handlers
  const handleSearchChange = useCallback((query: string) => {
    setUiState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const handleFilterChange = useCallback((filterType: 'garden' | 'activityType', value?: string) => {
    setUiState(prev => {
      const newState = { ...prev };
      if (filterType === 'garden') {
        newState.selectedGardenId = value;
      } else if (filterType === 'activityType') {
        newState.selectedActivityType = value;
      }
      return newState;
    });

    // Create new filters object
    const newFilters = {
      selectedGardenId: filterType === 'garden' ? value : uiState.selectedGardenId,
      selectedActivityType: filterType === 'activityType' ? value : uiState.selectedActivityType,
    };
    
    // Refetch data with new filters
    fetchActivities(1, false, newFilters);
    fetchDashboardStats(newFilters);
  }, [uiState.selectedGardenId, uiState.selectedActivityType, fetchActivities, fetchDashboardStats]);

  const handleDateRangeChange = useCallback((range: '7days' | '30days' | '90days') => {
    setUiState(prev => ({ ...prev, selectedDateRange: range }));
    fetchDetailedStats(range, currentFilters);
  }, [fetchDetailedStats, currentFilters.selectedGardenId, currentFilters.selectedActivityType]);

  // Effects
  useFocusEffect(
    useCallback(() => {
      const initialFilters = {
        selectedGardenId: uiState.selectedGardenId,
        selectedActivityType: uiState.selectedActivityType,
      };
      
      fetchUserGardens();
      fetchActivities(1, false, initialFilters);
      fetchDashboardStats(initialFilters);
    }, [fetchUserGardens, fetchActivities, fetchDashboardStats, uiState.selectedGardenId, uiState.selectedActivityType])
  );

  useEffect(() => {
    updateTotalStats();
  }, [pagination?.totalItems, updateTotalStats]);

  useEffect(() => {
    if (uiState.isStatsExpanded) {
      const filters = {
        selectedGardenId: uiState.selectedGardenId,
        selectedActivityType: uiState.selectedActivityType,
      };
      fetchDetailedStats(uiState.selectedDateRange, filters);
    }
  }, [uiState.isStatsExpanded, uiState.selectedDateRange, uiState.selectedGardenId, uiState.selectedActivityType, fetchDetailedStats]);

  // Render functions
  const renderSectionHeader = ({ section }: { section: ActivitySection }) => (
    <View style={styles.sectionHeaderContainer}>
      <View style={styles.calendarIconContainer}>
        <Ionicons name="calendar-outline" size={16} color={theme.primary} />
      </View>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  const renderActivityItem = ({ item, index, section }: { 
    item: GardenActivityDto, 
    index: number, 
    section: ActivitySection 
  }) => (
    <JournalActivityItem
      activity={item}
      isLastInSection={index === section.data.length - 1}
      onAnalyticsPress={handleActivityAnalytics}
    />
  );

  const renderFooter = () => {
    if (!data.loadingMore) return null;
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={theme.primary} />
        <Text style={styles.loadingText}>Đang tải thêm...</Text>
      </View>
    );
  };

  const handleEndReached = useCallback(() => {
    loadMoreActivities(currentFilters);
  }, [loadMoreActivities, currentFilters.selectedGardenId, currentFilters.selectedActivityType]);

  const handleRefresh = useCallback(() => {
    onRefresh(currentFilters);
  }, [onRefresh, currentFilters.selectedGardenId, currentFilters.selectedActivityType]);

  const handleCreateActivity = () => {
    router.push('/activity/create');
  };

  const handleActivityAnalytics = async (activityId: number) => {
    console.log('handleActivityAnalytics called with activityId:', activityId);
    setSelectedActivityId(activityId);
    setAnalyticsModalVisible(true);
    setAnalyticsLoading(true);
    setAnalyticsData(null);

    try {
      const data = await activityService.getActivityAnalysis(activityId);
      console.log('Analytics data received:', data);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalyticsData(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleCloseAnalyticsModal = () => {
    setAnalyticsModalVisible(false);
    setSelectedActivityId(null);
    setAnalyticsData(null);
    setAnalyticsLoading(false);
  };

  // Render main content
  const renderContent = () => {
    if (data.loading) {
      return (
        <View style={[styles.emptyContainer, { justifyContent: 'center' }]}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ marginTop: 16, color: theme.textSecondary }}>
            Đang tải nhật ký hoạt động...
          </Text>
        </View>
      );
    }

    if (data.error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{data.error}</Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => fetchActivities(1, false, currentFilters)}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.emptyButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (filteredActivities.length === 0) {
      return (
        <JournalEmptyState
          searchQuery={uiState.searchQuery.trim() || undefined}
          hasFilters={hasActiveFilters}
        />
      );
    }

    return (
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderActivityItem}
        renderSectionHeader={renderSectionHeader}
        refreshControl={
          <RefreshControl
            refreshing={data.refreshing}
            onRefresh={handleRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Compact Header with search and stats */}
      <JournalHeader
        stats={stats}
        isSearchActive={uiState.isSearchActive}
        setIsSearchActive={(active) => 
          setUiState(prev => ({ ...prev, isSearchActive: active }))
        }
        searchQuery={uiState.searchQuery}
        onSearchChange={handleSearchChange}
        activities={filteredActivities}
      />

      {/* Compact Filters - Luôn hiển thị */}
      <JournalFilters
        isExpanded={true}
        setIsExpanded={() => {}} // Không cần toggle nữa
        selectedGardenId={uiState.selectedGardenId}
        setSelectedGardenId={(id) => handleFilterChange('garden', id)}
        selectedActivityType={uiState.selectedActivityType}
        setSelectedActivityType={(type) => handleFilterChange('activityType', type)}
        gardens={data.gardens}
        loadingGardens={data.loadingGardens}
        gardenFetchError={data.gardenFetchError}
        isStatsExpanded={uiState.isStatsExpanded}
        setIsStatsExpanded={(expanded) => setUiState(prev => ({ ...prev, isStatsExpanded: expanded }))}
      />

      {/* Compact Detailed Stats */}
      <JournalDetailedStats
        isExpanded={uiState.isStatsExpanded}
        detailedStats={detailedStats}
        statsLoading={statsLoading}
        statsError={statsError}
        selectedDateRange={uiState.selectedDateRange}
        setSelectedDateRange={handleDateRangeChange}
      />

      {/* Main Content with improved flex */}
      <View style={styles.contentWrapper}>
        {renderContent()}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateActivity}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} style={styles.fabIcon} />
      </TouchableOpacity>

      {/* Activity Analytics Modal */}
      <ActivityAnalyticsModal
        visible={analyticsModalVisible}
        analytics={analyticsData}
        loading={analyticsLoading}
        onClose={handleCloseAnalyticsModal}
      />
    </View>
  );
} 