import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { createStatsStyles } from '../styles/statsStyles';
import { ActivityStatsResponseDto } from '@/types/activities/dtos';
import { ACTIVITY_COLOR_MAP, ACTIVITY_TYPE_TRANSLATIONS } from '../types';
import { getActivityIcon, formatPercentage, formatNumber } from '../utils/journalUtils';

interface JournalDetailedStatsProps {
  isExpanded: boolean;
  detailedStats: ActivityStatsResponseDto | null;
  statsLoading: boolean;
  statsError: string | null;
  selectedDateRange: '7days' | '30days' | '90days';
  setSelectedDateRange: (range: '7days' | '30days' | '90days') => void;
}

export const JournalDetailedStats: React.FC<JournalDetailedStatsProps> = ({
  isExpanded,
  detailedStats,
  statsLoading,
  statsError,
  selectedDateRange,
  setSelectedDateRange,
}) => {
  const theme = useAppTheme();
  const styles = createStatsStyles(theme);

  if (!isExpanded) return null;

  if (statsLoading) {
    return (
      <View style={styles.compactStatsContainer}>
        <View style={[styles.compactStatsLoadingContainer]}>
          <ActivityIndicator size="small" color={theme.primary} />
          <Text style={styles.compactStatsLoadingText}>Đang tải thống kê chi tiết...</Text>
        </View>
      </View>
    );
  }

  if (statsError || !detailedStats) {
    return (
      <View style={styles.compactStatsContainer}>
        <Text style={styles.compactStatsErrorText}>
          {statsError || "Chưa có dữ liệu thống kê chi tiết"}
        </Text>
        {!detailedStats && !statsError && (
          <Text style={[styles.compactStatsErrorText, { fontSize: 10, marginTop: 8 }]}>
            Tip: Click nút "Xem" để tải dữ liệu thống kê
          </Text>
        )}
      </View>
    );
  }

  const { overview, byActivityType } = detailedStats;

  // Fallback if no data in detailedStats
  if (!overview) {
    return (
      <View style={styles.compactStatsContainer}>
        <Text style={styles.compactStatsErrorText}>
          Dữ liệu thống kê không đầy đủ
        </Text>
        <Text style={[styles.compactStatsErrorText, { fontSize: 10, marginTop: 8 }]}>
          Hãy thêm một số hoạt động vào vườn để xem thống kê chi tiết
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.compactDetailedStatsContainer}>
      <ScrollView 
        style={styles.compactDetailedStatsScroll}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {/* Compact Date Range Selector */}
        <View style={styles.compactDateRangeSelectorCard}>
          <View style={styles.compactDateRangeHeader}>
            <Ionicons name="calendar-outline" size={14} color={theme.primary} />
            <Text style={styles.compactDateRangeTitle}>Thời gian</Text>
          </View>
          <View style={styles.compactDateRangeOptionsRow}>
            {[
              { value: '7days', label: '7 ngày' },
              { value: '30days', label: '30 ngày' },
              { value: '90days', label: '90 ngày' }
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.compactDateRangeOptionButton,
                  selectedDateRange === option.value && styles.compactDateRangeOptionSelected
                ]}
                onPress={() => setSelectedDateRange(option.value as typeof selectedDateRange)}
              >
                <Text style={[
                  styles.compactDateRangeOptionText,
                  selectedDateRange === option.value && styles.compactDateRangeOptionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Compact Overview Stats */}
        <View style={styles.compactOverviewStatsCard}>
          <View style={styles.compactSectionHeader}>
            <Ionicons name="analytics-outline" size={14} color={theme.primary} />
            <Text style={styles.compactSectionHeaderText}>Tổng quan</Text>
          </View>
          <View style={styles.compactOverviewStatsGrid}>
            {[
              { 
                value: formatNumber(overview.totalActivities), 
                label: 'Tổng số', 
                icon: 'library-outline',
                color: theme.primary 
              },
              { 
                value: overview.averagePerDay.toFixed(1), 
                label: 'TB/ngày', 
                icon: 'trending-up-outline',
                color: '#10B981' 
              },
              { 
                value: overview.activeDays.toString(), 
                label: 'Ngày HĐ', 
                icon: 'calendar-clear-outline',
                color: '#F59E0B' 
              },
              { 
                value: formatPercentage(overview.activityRate), 
                label: 'Tỷ lệ', 
                icon: 'pie-chart-outline',
                color: '#8B5CF6' 
              }
            ].map((item, index) => (
              <View key={index} style={styles.compactOverviewStatItem}>
                <View style={[styles.compactOverviewStatIcon, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon as any} size={14} color={item.color} />
                </View>
                <Text style={styles.compactOverviewStatValue}>{item.value}</Text>
                <Text style={styles.compactOverviewStatLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Compact Activity Types & Highlights */}
        <View style={styles.compactActivityHighlightsRow}>
          {/* Activity Types */}
          {byActivityType && byActivityType.length > 0 && (
            <View style={styles.compactActivityTypesCard}>
              <View style={styles.compactSmallSectionHeader}>
                <Ionicons name="grid-outline" size={12} color={theme.primary} />
                <Text style={styles.compactSmallSectionHeaderText}>Loại hoạt động</Text>
              </View>
              {byActivityType.slice(0, 3).map((typeStats, index) => (
                <View key={typeStats.type} style={styles.compactActivityTypeRow}>
                  <View style={[
                    styles.compactActivityTypeIconSmall,
                    { backgroundColor: ACTIVITY_COLOR_MAP[typeStats.type] + '20' }
                  ]}>
                    <Ionicons
                      name={getActivityIcon(typeStats.type)}
                      size={10}
                      color={ACTIVITY_COLOR_MAP[typeStats.type] || theme.primary}
                    />
                  </View>
                  <View style={styles.compactActivityTypeInfo}>
                    <Text style={styles.compactActivityTypeNameSmall}>{typeStats.displayName}</Text>
                    <Text style={styles.compactActivityTypeCount}>{typeStats.count}</Text>
                  </View>
                  <Text style={[
                    styles.compactActivityTypePercentage,
                    { color: ACTIVITY_COLOR_MAP[typeStats.type] || theme.primary }
                  ]}>
                    {formatPercentage(typeStats.percentage)}
                  </Text>
                </View>
              ))}
              {byActivityType.length > 3 && (
                <Text style={styles.compactMoreText}>+{byActivityType.length - 3} loại khác</Text>
              )}
            </View>
          )}

          {/* Highlights */}
          <View style={styles.compactHighlightsCard}>
            {/* Top Garden */}
            {overview.mostActiveGarden && (
              <View style={styles.compactHighlightItem}>
                <View style={styles.compactHighlightIconContainer}>
                  <Ionicons name="trophy" size={12} color="#FFD700" />
                </View>
                <View style={styles.compactHighlightContent}>
                  <Text style={styles.compactHighlightLabel}>Vườn tích cực</Text>
                  <Text style={styles.compactHighlightValue}>{overview.mostActiveGarden.gardenName}</Text>
                  <Text style={styles.compactHighlightSubtext}>{overview.mostActiveGarden.activityCount} HĐ</Text>
                </View>
              </View>
            )}

            {/* Popular Activity */}
            <View style={styles.compactHighlightItem}>
              <View style={[
                styles.compactHighlightIconContainer,
                { backgroundColor: ACTIVITY_COLOR_MAP[overview.mostCommonActivity] + '20' }
              ]}>
                <Ionicons
                  name={getActivityIcon(overview.mostCommonActivity)}
                  size={12}
                  color={ACTIVITY_COLOR_MAP[overview.mostCommonActivity] || theme.primary}
                />
              </View>
              <View style={styles.compactHighlightContent}>
                <Text style={styles.compactHighlightLabel}>Phổ biến</Text>
                <Text style={styles.compactHighlightValue}>
                  {ACTIVITY_TYPE_TRANSLATIONS[overview.mostCommonActivity] || overview.mostCommonActivity}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}; 