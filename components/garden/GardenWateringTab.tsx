import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/ui/useAppTheme';
import { useGardenWatering } from '@/hooks/garden/useGardenWatering';
import { 
  CreateWateringSchedule, 
} from '@/types/activities/watering-schedules.type';
import CreateScheduleModal from './watering/CreateScheduleModal';

interface GardenWateringTabProps {
  gardenId: string | null;
}

const GardenWateringTab: React.FC<GardenWateringTabProps> = ({ gardenId }) => {
  const theme = useAppTheme();
  const [createModalVisible, setCreateModalVisible] = useState(false);

  // Get surface color with fallback
  const surfaceColor = theme.card || theme.background || '#FFFFFF';

  const {
    schedules,
    upcomingSchedules,
    schedulesLoading,
    schedulesRefreshing,
    currentDecision,
    decisionLoading,
    decisionStats,
    statsLoading,
    aiConnectionStatus,
    refreshData,
    createSchedule,
    autoGenerateSchedule,
    completeSchedule,
    skipSchedule,
    deleteSchedule,
    getAIDecision,
    getOptimalWaterAmount,
    testAIConnection,
    isCreatingSchedule,
    isAutoGenerating,
    actionLoading,
  } = useGardenWatering({ gardenId });

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return theme.warning || '#FFA726';
      case 'COMPLETED': return theme.success || '#66BB6A';
      case 'SKIPPED': return theme.textSecondary || '#999';
      case 'CANCELLED': return theme.error || '#EF5350';
      default: return theme.textSecondary || '#999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Chờ thực hiện';
      case 'COMPLETED': return 'Đã hoàn thành';
      case 'SKIPPED': return 'Đã bỏ qua';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'water_now': return 'water';
      case 'no_water': return 'close-circle-outline';
      case 'check_later': return 'time-outline';
      default: return 'help-circle-outline';
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'water_now': return theme.primary || '#2196F3';
      case 'no_water': return theme.error || '#EF5350';
      case 'check_later': return theme.warning || '#FFA726';
      default: return theme.textSecondary || '#999';
    }
  };

  const getDecisionText = (decision: string) => {
    switch (decision) {
      case 'water_now': return 'Cần tưới ngay';
      case 'no_water': return 'Không cần tưới';
      case 'check_later': return 'Kiểm tra lại sau';
      default: return decision;
    }
  };

  const handleCreateSchedule = async (data: CreateWateringSchedule) => {
    const success = await createSchedule(data);
    if (success) {
      setCreateModalVisible(false);
      Alert.alert('Thành công', 'Đã tạo lịch tưới nước');
    } else {
      Alert.alert('Lỗi', 'Không thể tạo lịch tưới nước');
    }
  };

  const handleAutoGenerate = async () => {
    Alert.alert(
      'Tự động tạo lịch',
      'Bạn có muốn AI tự động tạo lịch tưới nước dựa trên dữ liệu cảm biến?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          onPress: async () => {
            const success = await autoGenerateSchedule();
            if (success) {
              Alert.alert('Thành công', 'Đã tự động tạo lịch tưới nước');
            } else {
              Alert.alert('Lỗi', 'Không thể tự động tạo lịch');
            }
          },
        },
      ]
    );
  };

  const handleScheduleAction = (scheduleId: number, action: 'complete' | 'skip' | 'delete') => {
    const actionText = action === 'complete' ? 'hoàn thành' : action === 'skip' ? 'bỏ qua' : 'xóa';
    
    Alert.alert(
      `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} lịch`,
      `Bạn có chắc muốn ${actionText} lịch tưới này?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          onPress: async () => {
            let success = false;
            switch (action) {
              case 'complete':
                success = await completeSchedule(scheduleId);
                break;
              case 'skip':
                success = await skipSchedule(scheduleId);
                break;
              case 'delete':
                success = await deleteSchedule(scheduleId);
                break;
            }
            
            if (success) {
              Alert.alert('Thành công', `Đã ${actionText} lịch tưới`);
            } else {
              Alert.alert('Lỗi', `Không thể ${actionText} lịch`);
            }
          },
        },
      ]
    );
  };

  const handleGetAIDecision = async () => {
    await getAIDecision();
  };

  const renderAIConnectionBadge = () => (
    <View style={[styles.connectionBadge, { backgroundColor: getConnectionColor() }]}>
      <Ionicons 
        name={getConnectionIcon()} 
        size={12} 
        color="white" 
      />
      <Text style={styles.connectionText}>
        {getConnectionText()}
      </Text>
    </View>
  );

  const getConnectionColor = () => {
    switch (aiConnectionStatus) {
      case 'connected': return theme.success || '#66BB6A';
      case 'disconnected': return theme.error || '#EF5350';
      case 'testing': return theme.warning || '#FFA726';
      default: return theme.textSecondary || '#999';
    }
  };

  const getConnectionIcon = () => {
    switch (aiConnectionStatus) {
      case 'connected': return 'checkmark-circle';
      case 'disconnected': return 'close-circle';
      case 'testing': return 'time';
      default: return 'help-circle';
    }
  };

  const getConnectionText = () => {
    switch (aiConnectionStatus) {
      case 'connected': return 'AI Kết nối';
      case 'disconnected': return 'AI Mất kết nối';
      case 'testing': return 'Đang kiểm tra';
      default: return 'Không xác định';
    }
  };

  const handleOpenCreateModal = () => {
    if (!gardenId || isNaN(parseInt(gardenId, 10))) {
      Alert.alert('Lỗi', 'Không thể tạo lịch tưới. Vui lòng chọn vườn hợp lệ.');
      return;
    }
    setCreateModalVisible(true);
  };

  if (schedulesLoading && !schedules.length) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Đang tải dữ liệu tưới nước...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={schedulesRefreshing}
            onRefresh={refreshData}
            colors={[theme.primary || '#2196F3']}
          />
        }
      >
        {/* AI Decision Section */}
        <View style={[styles.section, { backgroundColor: surfaceColor }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Quyết định AI
            </Text>
            {renderAIConnectionBadge()}
          </View>

          {decisionLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={[styles.loadingRowText, { color: theme.textSecondary }]}>
                Đang phân tích...
              </Text>
            </View>
          ) : currentDecision ? (
            <View style={styles.decisionCard}>
              <View style={styles.decisionHeader}>
                <Ionicons
                  name={getDecisionIcon(currentDecision.decision)}
                  size={24}
                  color={getDecisionColor(currentDecision.decision)}
                />
                <View style={styles.decisionInfo}>
                  <Text style={[styles.decisionText, { color: theme.text }]}>
                    {getDecisionText(currentDecision.decision)}
                  </Text>
                  <Text style={[styles.confidenceText, { color: theme.textSecondary }]}>
                    Độ tin cậy: {Math.round(currentDecision.confidence)}%
                  </Text>
                </View>
                <View style={styles.amountBadge}>
                  <Text style={[styles.amountText, { color: theme.text }]}>
                    {currentDecision.recommended_amount.toFixed(2)}L
                  </Text>
                </View>
              </View>

              <View style={styles.reasonsContainer}>
                <Text style={[styles.reasonsTitle, { color: theme.textSecondary }]}>
                  Lý do:
                </Text>
                {currentDecision.reasons.map((reason: string, index: number) => (
                  <Text key={index} style={[styles.reasonText, { color: theme.text }]}>
                    • {reason}
                  </Text>
                ))}
              </View>

              <View style={styles.sensorDataContainer}>
                <Text style={[styles.sensorDataTitle, { color: theme.textSecondary }]}>
                  Dữ liệu cảm biến:
                </Text>
                <View style={styles.sensorGrid}>
                  <View style={styles.sensorItem}>
                    <Text style={[styles.sensorLabel, { color: theme.textSecondary }]}>
                      Độ ẩm đất
                    </Text>
                    <Text style={[styles.sensorValue, { color: theme.text }]}>
                      {currentDecision.sensor_data.soil_moisture}%
                    </Text>
                  </View>
                  <View style={styles.sensorItem}>
                    <Text style={[styles.sensorLabel, { color: theme.textSecondary }]}>
                      Độ ẩm không khí
                    </Text>
                    <Text style={[styles.sensorValue, { color: theme.text }]}>
                      {currentDecision.sensor_data.air_humidity}%
                    </Text>
                  </View>
                  <View style={styles.sensorItem}>
                    <Text style={[styles.sensorLabel, { color: theme.textSecondary }]}>
                      Nhiệt độ
                    </Text>
                    <Text style={[styles.sensorValue, { color: theme.text }]}>
                      {currentDecision.sensor_data.temperature}°C
                    </Text>
                  </View>
                  <View style={styles.sensorItem}>
                    <Text style={[styles.sensorLabel, { color: theme.textSecondary }]}>
                      Ánh sáng
                    </Text>
                    <Text style={[styles.sensorValue, { color: theme.text }]}>
                      {currentDecision.sensor_data.light_intensity} lux
                    </Text>
                  </View>
                  <View style={styles.sensorItem}>
                    <Text style={[styles.sensorLabel, { color: theme.textSecondary }]}>
                      Mức nước
                    </Text>
                    <Text style={[styles.sensorValue, { color: theme.text }]}>
                      {currentDecision.sensor_data.water_level}%
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={[styles.timestampText, { color: theme.textSecondary }]}>
                Cập nhật: {formatDate(currentDecision.timestamp)}
              </Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="analytics-outline" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Chưa có quyết định AI
              </Text>
            </View>
          )}

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.primary }]}
              onPress={handleGetAIDecision}
              disabled={decisionLoading || aiConnectionStatus !== 'connected'}
            >
              {decisionLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="refresh" size={16} color="white" />
              )}
              <Text style={styles.actionButtonText}>Làm mới</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.warning || '#FFA726' }]}
              onPress={testAIConnection}
              disabled={aiConnectionStatus === 'testing'}
            >
              {aiConnectionStatus === 'testing' ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="wifi" size={16} color="white" />
              )}
              <Text style={styles.actionButtonText}>Test AI</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Stats Section */}
        {decisionStats && (
          <View style={[styles.section, { backgroundColor: surfaceColor }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Thống kê AI (30 ngày)
            </Text>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.primary }]}>
                  {decisionStats.totalDecisions}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Tổng quyết định
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.success || '#66BB6A' }]}>
                  {decisionStats.waterRecommendations}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Đề xuất tưới
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.warning || '#FFA726' }]}>
                  {Math.round(decisionStats.averageConfidence)}%
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Độ tin cậy TB
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.info || '#29B6F6' }]}>
                  {decisionStats.averageWaterAmount.toFixed(2)}L
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Lượng nước TB
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Upcoming Schedules Section */}
        {upcomingSchedules.length > 0 && (
          <View style={[styles.section, { backgroundColor: surfaceColor }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Lịch sắp tới
            </Text>

            {upcomingSchedules.map((schedule, index) => (
              <View key={index} style={[styles.upcomingItem, { borderLeftColor: theme.primary }]}>
                <Ionicons name="water" size={20} color={theme.primary} />
                <View style={styles.upcomingInfo}>
                  <Text style={[styles.upcomingName, { color: theme.text }]}>
                    {schedule.name}
                  </Text>
                  <Text style={[styles.upcomingTime, { color: theme.textSecondary }]}>
                    {formatDate(schedule.scheduledTime)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Watering Schedules Section */}
        <View style={[styles.section, { backgroundColor: surfaceColor }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Lịch tưới nước
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.primary }]}
              onPress={handleOpenCreateModal}
            >
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.success || '#66BB6A' }]}
              onPress={handleAutoGenerate}
              disabled={isAutoGenerating || aiConnectionStatus !== 'connected'}
            >
              {isAutoGenerating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="sparkles" size={16} color="white" />
              )}
              <Text style={styles.actionButtonText}>Tự động tạo</Text>
            </TouchableOpacity>
          </View>

          {schedules.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Chưa có lịch tưới nước
              </Text>
            </View>
          ) : (
            schedules.map((schedule) => (
              <View key={schedule.id} style={[styles.scheduleCard, { backgroundColor: theme.background, borderColor: theme.borderLight }]}>
                <View style={styles.scheduleHeader}>
                  <View style={styles.scheduleInfo}>
                    <Text style={[styles.scheduleTime, { color: theme.text }]}>
                      {formatDate(schedule.scheduledAt)}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(schedule.status) }]}>
                      <Text style={styles.statusText}>
                        {getStatusText(schedule.status)}
                      </Text>
                    </View>
                  </View>
                  
                  {schedule.amount && (
                    <Text style={[styles.scheduleAmount, { color: theme.primary }]}>
                      {schedule.amount.toFixed(2)}L
                    </Text>
                  )}
                </View>

                {schedule.notes && (
                  <Text style={[styles.scheduleNotes, { color: theme.textSecondary }]}>
                    {schedule.notes}
                  </Text>
                )}

                {schedule.reason && (
                  <Text style={[styles.scheduleReason, { color: theme.textSecondary }]}>
                    Lý do: {schedule.reason}
                  </Text>
                )}

                {schedule.status === 'PENDING' && (
                  <View style={styles.scheduleActions}>
                    <TouchableOpacity
                      style={[styles.scheduleActionBtn, { backgroundColor: theme.success || '#66BB6A' }]}
                      onPress={() => handleScheduleAction(schedule.id, 'complete')}
                      disabled={actionLoading[`complete-${schedule.id}`]}
                    >
                      {actionLoading[`complete-${schedule.id}`] ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <>
                          <Ionicons name="checkmark" size={16} color="white" />
                          <Text style={styles.scheduleActionText}>Hoàn thành</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.scheduleActionBtn, { backgroundColor: theme.warning || '#FFA726' }]}
                      onPress={() => handleScheduleAction(schedule.id, 'skip')}
                      disabled={actionLoading[`skip-${schedule.id}`]}
                    >
                      {actionLoading[`skip-${schedule.id}`] ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <>
                          <Ionicons name="play-skip-forward" size={16} color="white" />
                          <Text style={styles.scheduleActionText}>Bỏ qua</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.scheduleActionBtn, { backgroundColor: theme.error || '#EF5350' }]}
                      onPress={() => handleScheduleAction(schedule.id, 'delete')}
                      disabled={actionLoading[`delete-${schedule.id}`]}
                    >
                      {actionLoading[`delete-${schedule.id}`] ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <>
                          <Ionicons name="trash" size={16} color="white" />
                          <Text style={styles.scheduleActionText}>Xóa</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Create Schedule Modal */}
      {gardenId && !isNaN(parseInt(gardenId, 10)) && (
        <CreateScheduleModal
          visible={createModalVisible}
          onClose={() => setCreateModalVisible(false)}
          onSubmit={handleCreateSchedule}
          loading={isCreatingSchedule}
          gardenId={parseInt(gardenId, 10)}
          onGetOptimalAmount={getOptimalWaterAmount}
          aiConnectionStatus={aiConnectionStatus}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  connectionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'white',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingRowText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  decisionCard: {
    marginBottom: 16,
  },
  decisionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  decisionInfo: {
    flex: 1,
  },
  decisionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  confidenceText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  amountBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  amountText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  reasonsContainer: {
    marginBottom: 12,
  },
  reasonsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
    marginVertical: 1,
  },
  sensorDataContainer: {
    marginBottom: 12,
  },
  sensorDataTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sensorItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 8,
  },
  sensorLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  sensorValue: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  timestampText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'right',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
    flex: 1,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 4,
  },
  upcomingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 8,
    borderLeftWidth: 3,
    marginBottom: 8,
    gap: 12,
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  upcomingTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginTop: 12,
    textAlign: 'center',
  },
  scheduleCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTime: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  scheduleAmount: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  scheduleNotes: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  scheduleReason: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  scheduleActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  scheduleActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
    flex: 1,
    justifyContent: 'center',
  },
  scheduleActionText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
});

export default GardenWateringTab; 