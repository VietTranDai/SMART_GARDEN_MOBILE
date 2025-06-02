import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { createStatsStyles } from '../styles/statsStyles';
import { 
  ActivityStatsResponseDto, 
} from '@/types/activities/dtos';
import { ACTIVITY_COLOR_MAP } from '../types';
import { formatPercentage } from '../utils/journalUtils';

interface EnhancedStatsSectionProps {
  detailedStats: ActivityStatsResponseDto;
}

export const EnhancedStatsSection: React.FC<EnhancedStatsSectionProps> = ({
  detailedStats,
}) => {
  const theme = useAppTheme();
  const styles = createStatsStyles(theme);
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('daily');

  const { dailyStats, monthlyStats, generatedAt, period } = detailedStats;

  const renderDailyStats = () => {
    if (!dailyStats || dailyStats.length === 0) {
      return (
        <Text style={[styles.emptyText, { textAlign: 'center', padding: 20 }]}>
          Không có dữ liệu theo ngày
        </Text>
      );
    }

    const maxCount = Math.max(...dailyStats.map(d => d.activityCount));

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.dailyStatsContainer}>
          {dailyStats.map((dayStats, index) => {
            const barHeight = maxCount > 0 ? (dayStats.activityCount / maxCount) * 80 : 0;
            const date = new Date(dayStats.date);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <View key={dayStats.date} style={styles.dailyStatItem}>
                {/* Activity count bar */}
                <View style={styles.dailyBarContainer}>
                  <View 
                    style={[
                      styles.dailyBar,
                      { 
                        height: barHeight,
                        backgroundColor: isToday ? theme.primary : theme.primary + '60'
                      }
                    ]} 
                  />
                </View>
                
                {/* Count */}
                <Text style={[
                  styles.dailyCount,
                  { color: isToday ? theme.primary : theme.textSecondary }
                ]}>
                  {dayStats.activityCount}
                </Text>
                
                {/* Date */}
                <Text style={[
                  styles.dailyDate,
                  { color: isToday ? theme.primary : theme.textSecondary }
                ]}>
                  {date.toLocaleDateString('vi-VN', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Text>

                {/* Activity breakdown */}
                {dayStats.activityBreakdown && dayStats.activityBreakdown.length > 0 && (
                  <View style={styles.dailyBreakdownContainer}>
                    {dayStats.activityBreakdown.slice(0, 3).map((breakdown, bIndex) => (
                      <View 
                        key={breakdown.type} 
                        style={[
                          styles.dailyBreakdownDot,
                          { backgroundColor: ACTIVITY_COLOR_MAP[breakdown.type] || theme.primary }
                        ]} 
                      />
                    ))}
                    {dayStats.activityBreakdown.length > 3 && (
                      <Text style={styles.dailyBreakdownMore}>+{dayStats.activityBreakdown.length - 3}</Text>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  const renderMonthlyStats = () => {
    if (!monthlyStats || monthlyStats.length === 0) {
      return (
        <Text style={[styles.emptyText, { textAlign: 'center', padding: 20 }]}>
          Không có dữ liệu theo tháng
        </Text>
      );
    }

    return (
      <View style={styles.monthlyStatsContainer}>
        {monthlyStats.map((monthStats, index) => {
          const progressPercentage = (monthStats.activeDays / 31) * 100; // Assuming max 31 days

          return (
            <View key={monthStats.month} style={styles.monthlyStatCard}>
              <View style={styles.monthlyStatHeader}>
                <Text style={styles.monthlyStatTitle}>
                  {new Date(monthStats.month + '-01').toLocaleDateString('vi-VN', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </Text>
                <Text style={[styles.monthlyStatValue, { color: theme.primary }]}>
                  {monthStats.activityCount} hoạt động
                </Text>
              </View>

              <View style={styles.monthlyStatDetails}>
                <View style={styles.monthlyStatDetail}>
                  <Text style={styles.monthlyStatDetailLabel}>Ngày hoạt động</Text>
                  <Text style={styles.monthlyStatDetailValue}>{monthStats.activeDays}</Text>
                </View>
                <View style={styles.monthlyStatDetail}>
                  <Text style={styles.monthlyStatDetailLabel}>TB/ngày</Text>
                  <Text style={styles.monthlyStatDetailValue}>{monthStats.averagePerDay.toFixed(1)}</Text>
                </View>
              </View>

              {/* Progress bar */}
              <View style={{ marginTop: 8 }}>
                <View style={{
                  height: 8,
                  backgroundColor: theme.border + '20',
                  borderRadius: 4,
                  marginBottom: 4,
                }}>
                  <View 
                    style={{
                      width: `${Math.min(progressPercentage, 100)}%`,
                      height: '100%',
                      backgroundColor: theme.primary,
                      borderRadius: 4,
                    }} 
                  />
                </View>
                <Text style={{
                  fontSize: 11,
                  color: theme.textSecondary,
                  textAlign: 'center',
                }}>
                  {formatPercentage(progressPercentage / 100)} ngày có hoạt động
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.enhancedStatsSection}>
      {/* Header with metadata */}
      <View style={styles.enhancedStatsSectionHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="bar-chart-outline" size={18} color={theme.primary} />
          <Text style={styles.enhancedStatsSectionTitle}>Phân tích chi tiết</Text>
        </View>
        <Text style={{
          fontSize: 12,
          color: theme.textSecondary,
        }}>
          {new Date(period.startDate).toLocaleDateString('vi-VN')} - {' '}
          {new Date(period.endDate).toLocaleDateString('vi-VN')}
        </Text>
      </View>

      {/* Tab selector */}
      <View style={styles.statsTabContainer}>
        <TouchableOpacity
          style={[
            styles.statsTab,
            activeTab === 'daily' && styles.statsTabActive
          ]}
          onPress={() => setActiveTab('daily')}
        >
          <Ionicons 
            name="calendar-outline" 
            size={16} 
            color={activeTab === 'daily' ? '#FFFFFF' : theme.textSecondary} 
          />
          <Text style={[
            styles.statsTabText,
            activeTab === 'daily' && styles.statsTabTextActive
          ]}>
            Theo ngày
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statsTab,
            activeTab === 'monthly' && styles.statsTabActive
          ]}
          onPress={() => setActiveTab('monthly')}
        >
          <Ionicons 
            name="calendar-number-outline" 
            size={16} 
            color={activeTab === 'monthly' ? '#FFFFFF' : theme.textSecondary} 
          />
          <Text style={[
            styles.statsTabText,
            activeTab === 'monthly' && styles.statsTabTextActive
          ]}>
            Theo tháng
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={{ minHeight: 200 }}>
        {activeTab === 'daily' ? renderDailyStats() : renderMonthlyStats()}
      </View>

      {/* Generation info */}
      <Text style={{
        fontSize: 11,
        color: theme.textSecondary,
        textAlign: 'center',
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: theme.border + '20',
      }}>
        Cập nhật: {new Date(generatedAt).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </Text>
    </View>
  );
}; 