import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GardenActivityAnalyticsDto } from '../../../types/activities/dtos';
import { useTheme } from '../../../contexts/ThemeContext';

// Helper functions for analytics
const formatPercentile = (value: number) => `${Math.round(value)}%`;
const formatEfficiencyRating = (value: number) => `${Math.round(value * 100)}%`;
const translateActivityType = (activityType: string) => {
  switch(activityType) {
    case 'WATERING': return 'Tưới nước';
    case 'FERTILIZING': return 'Bón phân';
    case 'PRUNING': return 'Cắt tỉa';
    case 'HARVESTING': return 'Thu hoạch';
    case 'PLANTING': return 'Trồng cây';
    case 'WEEDING': return 'Nhổ cỏ dại';
    case 'PEST_CONTROL': return 'Diệt sâu bệnh';
    case 'SOIL_PREPARATION': return 'Chuẩn bị đất';
    case 'MULCHING': return 'Phủ mulch';
    case 'TRANSPLANTING': return 'Cấy ghép';
    case 'MONITORING': return 'Theo dõi';
    case 'MAINTENANCE': return 'Bảo dưỡng';
    case 'CLEANING': return 'Vệ sinh';
    case 'SEEDING': return 'Gieo hạt';
    case 'INSPECTION': return 'Kiểm tra';
    default: return activityType;
  }
};
const translateImprovementTrend = (trend: string) => {
  switch(trend) {
    case 'IMPROVING': return 'Đang cải thiện';
    case 'STABLE': return 'Ổn định';  
    case 'DECLINING': return 'Đang giảm';
    default: return trend;
  }
};
const translateEffectivenessLevel = (level: string) => {
  switch(level) {
    case 'EFFECTIVE': return 'Hiệu quả';
    case 'OPTIMAL': return 'Tối ưu';
    case 'SUBOPTIMAL': return 'Chưa tối ưu';
    case 'INEFFECTIVE': return 'Không hiệu quả';
    default: return level;
  }
};
const formatSkillLevel = (level: string) => {
  switch(level) {
    case 'BEGINNER': return 'Người mới';
    case 'INTERMEDIATE': return 'Trung cấp';
    case 'ADVANCED': return 'Nâng cao';
    case 'EXPERT': return 'Chuyên gia';
    default: return level;
  }
};
const getRatingColor = (rating: number) => {
  if (rating >= 0.8) return '#10B981';
  if (rating >= 0.6) return '#F59E0B';
  return '#EF4444';
};
const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
  }
  return `${mins}m`;
};

interface ActivityAnalyticsModalProps {
  visible: boolean;
  onClose: () => void;
  analytics: GardenActivityAnalyticsDto | null;
  loading?: boolean;
}

export const ActivityAnalyticsModal: React.FC<ActivityAnalyticsModalProps> = ({
  visible,
  onClose,
  analytics,
  loading = false
}) => {
  const { isDarkMode } = useTheme();

  const theme = {
    primary: '#4F46E5',
    surface: isDarkMode ? '#1F2937' : '#FFFFFF',
    surfaceVariant: isDarkMode ? '#374151' : '#F8FAFC',
    text: isDarkMode ? '#F9FAFB' : '#111827',
    textSecondary: isDarkMode ? '#D1D5DB' : '#6B7280',
    outline: isDarkMode ? '#4B5563' : '#E5E7EB',
    background: isDarkMode ? '#111827' : '#F9FAFB',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  };

  const Section = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
    <View style={{ marginBottom: 20 }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.outline
      }}>
        <Text style={{ fontSize: 22, marginRight: 8 }}>{icon}</Text>
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: theme.text
        }}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );

  const InfoCard = ({ children }: { children: React.ReactNode }) => (
    <View style={{
      backgroundColor: theme.surfaceVariant,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12
    }}>
      {children}
    </View>
  );

  const InfoRow = ({ label, value, valueColor }: { label: string; value: string | number; valueColor?: string }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
      <Text style={{ fontSize: 15, color: theme.textSecondary, flex: 1 }}>{label}:</Text>
      <Text style={{
        fontSize: 15,
        fontWeight: '600',
        color: valueColor || theme.text,
        flex: 1,
        textAlign: 'right'
      }}>
        {value}
      </Text>
    </View>
  );

  const renderBasicInfo = () => analytics && (
    <Section title="Thông tin cơ bản" icon="📋">
      <InfoCard>
        <InfoRow label="Tên hoạt động" value={analytics.name || 'Không có tên'} />
        <InfoRow label="Loại hoạt động" value={translateActivityType(analytics.activityType || 'Không xác định')} />
        <InfoRow label="Thời gian thực hiện" value={new Date(analytics.timestamp).toLocaleString('vi-VN')} />
        <InfoRow label="Lý do thực hiện" value={analytics.reason || 'Không có lý do'} />
        {analytics.details && <InfoRow label="Chi tiết" value={analytics.details} />}
        {analytics.notes && <InfoRow label="Ghi chú" value={analytics.notes} />}
      </InfoCard>
    </Section>
  );

  const renderGardenInfo = () => analytics?.garden && (
    <Section title="Thông tin vườn" icon="🌱">
      <InfoCard>
        <InfoRow label="Tên vườn" value={analytics.garden.name || 'Không có tên'} />
        <InfoRow label="Loại vườn" value={analytics.garden.type === 'OUTDOOR' ? 'Ngoài trời' : 'Trong nhà'} />
        <InfoRow label="Trạng thái" value={analytics.garden.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'} />
        <InfoRow label="Địa điểm" value={`${analytics.garden.ward || ''}, ${analytics.garden.district || ''}, ${analytics.garden.city || ''}`} />
        <InfoRow label="Cây trồng" value={analytics.plantName || 'Không xác định'} />
        <InfoRow label="Giai đoạn phát triển" value={analytics.plantGrowStage || 'Không xác định'} />
      </InfoCard>
    </Section>
  );

  const renderGardenerInfo = () => analytics?.gardener && (
    <Section title="Người làm vườn" icon="👨‍🌾">
      <InfoCard>
        <InfoRow 
          label="Tên" 
          value={`${analytics.gardener.user?.firstName || ''} ${analytics.gardener.user?.lastName || ''}`.trim() || 'Không có tên'} 
        />
        <InfoRow label="Username" value={analytics.gardener.user?.username || 'Không có username'} />
        <InfoRow label="Cấp độ kinh nghiệm" value={analytics.gardener.experienceLevel?.title || 'Không xác định'} />
        <InfoRow label="Điểm kinh nghiệm" value={(analytics.gardener.experiencePoints || 0).toLocaleString('vi-VN')} />
      </InfoCard>
    </Section>
  );

  const renderExecutionDetails = () => analytics?.executionDetails && (
    <Section title="Chi tiết thực hiện" icon="⚡">
      <InfoCard>
        <InfoRow label="Thời gian dự kiến" value={`${analytics.executionDetails.executionConditions?.availableTime || 0} phút`} />
        <InfoRow label="Thời gian thực tế" value={`${analytics.executionDetails.actualDuration || 0} phút`} />
        <InfoRow 
          label="Hiệu quả thời gian" 
          value={formatPercentile(analytics.executionDetails.durationEfficiency || 0)}
          valueColor={getRatingColor((analytics.executionDetails.durationEfficiency || 0) / 100)}
        />
        <InfoRow label="Phương pháp" value={analytics.executionDetails.method || 'Không xác định'} />
        <InfoRow 
          label="Mức độ khó" 
          value={analytics.executionDetails.executionConditions?.difficultyLevel === 'EASY' ? 'Dễ' : 
                analytics.executionDetails.executionConditions?.difficultyLevel === 'MEDIUM' ? 'Trung bình' : 
                analytics.executionDetails.executionConditions?.difficultyLevel === 'HARD' ? 'Khó' : 'Không xác định'} 
        />
        <InfoRow 
          label="Tỷ lệ hoàn thành" 
          value={formatPercentile(analytics.executionDetails.immediateResults?.completionRate || 0)}
          valueColor={getRatingColor((analytics.executionDetails.immediateResults?.completionRate || 0) / 100)}
        />
        <InfoRow 
          label="Đánh giá chất lượng" 
          value={`${analytics.executionDetails.immediateResults?.qualityRating || 0}/5 ⭐`}
          valueColor={getRatingColor((analytics.executionDetails.immediateResults?.qualityRating || 0) / 5)}
        />
      </InfoCard>
      
      {analytics.executionDetails.toolsUsed && analytics.executionDetails.toolsUsed.length > 0 && (
        <InfoCard>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 8 }}>
            Dụng cụ sử dụng:
          </Text>
          <Text style={{ fontSize: 15, color: theme.textSecondary }}>
            {analytics.executionDetails.toolsUsed.join(', ')}
          </Text>
        </InfoCard>
      )}
      
      {analytics.executionDetails.materialsUsed && analytics.executionDetails.materialsUsed.length > 0 && (
        <InfoCard>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 8 }}>
            Vật liệu sử dụng:
          </Text>
          <Text style={{ fontSize: 15, color: theme.textSecondary }}>
            {analytics.executionDetails.materialsUsed.join(', ')}
          </Text>
        </InfoCard>
      )}
    </Section>
  );

  const renderEffectivenessAnalysis = () => analytics?.effectivenessAnalysis && (
    <Section title="Phân tích hiệu quả" icon="📊">
      <InfoCard>
        <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 10 }}>
          Hiệu quả tức thì:
        </Text>
        <InfoRow 
          label="Tổng thể" 
          value={translateEffectivenessLevel(analytics.effectivenessAnalysis.immediateEffectiveness?.overallEffectiveness || 'INEFFECTIVE')}
          valueColor={analytics.effectivenessAnalysis.immediateEffectiveness?.overallEffectiveness === 'EFFECTIVE' ? theme.success : theme.warning}
        />
        <InfoRow 
          label="Điểm chất lượng" 
          value={`${analytics.effectivenessAnalysis.immediateEffectiveness?.qualityScore || 0}/100`}
          valueColor={getRatingColor((analytics.effectivenessAnalysis.immediateEffectiveness?.qualityScore || 0) / 100)}
        />
        <InfoRow 
          label="Hiệu quả thời gian" 
          value={formatPercentile(analytics.effectivenessAnalysis.immediateEffectiveness?.timeEfficiency || 0)}
          valueColor={getRatingColor((analytics.effectivenessAnalysis.immediateEffectiveness?.timeEfficiency || 0) / 100)}
        />
        <InfoRow 
          label="Hiệu quả tài nguyên" 
          value={formatPercentile(analytics.effectivenessAnalysis.immediateEffectiveness?.resourceEfficiency || 0)}
          valueColor={getRatingColor((analytics.effectivenessAnalysis.immediateEffectiveness?.resourceEfficiency || 0) / 100)}
        />
      </InfoCard>

      {analytics.effectivenessAnalysis.longTermEffectiveness && (
        <InfoCard>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 10 }}>
            Hiệu quả dài hạn:
          </Text>
          <InfoRow label="Tác động tích lũy" value={`${analytics.effectivenessAnalysis.longTermEffectiveness.cumulativeEffect || 0}%`} />
          <InfoRow label="Tác động đến tăng trưởng" value={`${analytics.effectivenessAnalysis.longTermEffectiveness.growthImpact || 0}%`} />
          <InfoRow label="Tác động đến sức khỏe cây" value={`${analytics.effectivenessAnalysis.longTermEffectiveness.plantHealthImpact || 0}%`} />
          <InfoRow label="Tác động năng suất" value={`${analytics.effectivenessAnalysis.longTermEffectiveness.yieldImpact || 0}%`} />
        </InfoCard>
      )}

      {analytics.effectivenessAnalysis.outcomes && (
        <InfoCard>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 10 }}>
            Kết quả đạt được:
          </Text>
          <InfoRow 
            label="Tỷ lệ thành công" 
            value={formatPercentile(analytics.effectivenessAnalysis.outcomes.successRate || 0)}
            valueColor={getRatingColor((analytics.effectivenessAnalysis.outcomes.successRate || 0) / 100)}
          />
          <InfoRow label="Giá trị kinh tế" value={`${(analytics.effectivenessAnalysis.outcomes.economicValue || 0).toLocaleString('vi-VN')} VNĐ`} />
          <InfoRow 
            label="Mức độ hài lòng" 
            value={`${analytics.effectivenessAnalysis.outcomes.satisfactionValue || 0}/10`}
            valueColor={getRatingColor((analytics.effectivenessAnalysis.outcomes.satisfactionValue || 0) / 10)}
          />
          <InfoRow label="Thời gian tiết kiệm" value={`${analytics.effectivenessAnalysis.outcomes.timeValueSaved || 0} phút`} />
        </InfoCard>
      )}
    </Section>
  );

  const renderUserPerformance = () => analytics?.userPerformance && (
    <Section title="Hiệu suất cá nhân" icon="🎯">
      {analytics.userPerformance.skillAssessment && (
        <InfoCard>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 10 }}>
            Đánh giá kỹ năng:
          </Text>
          <InfoRow 
            label="Cấp độ kỹ năng hiện tại" 
            value={formatSkillLevel(analytics.userPerformance.skillAssessment.currentSkillLevel || 'BEGINNER')} 
          />
          <InfoRow 
            label="Chuyên môn hoạt động" 
            value={formatPercentile(analytics.userPerformance.skillAssessment.activityExpertise || 0)}
            valueColor={getRatingColor((analytics.userPerformance.skillAssessment.activityExpertise || 0) / 100)}
          />
          <InfoRow 
            label="Tốc độ cải thiện" 
            value={`${(analytics.userPerformance.skillAssessment.improvementRate || 0).toFixed(1)}%/tháng`}
            valueColor={theme.success}
          />
        </InfoCard>
      )}

      {analytics.userPerformance.workEfficiency && (
        <InfoCard>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 10 }}>
            Hiệu quả công việc:
          </Text>
          <InfoRow 
            label="Đánh giá tốc độ" 
            value={`${analytics.userPerformance.workEfficiency.speedRating || 0}/5 ⭐`}
            valueColor={getRatingColor((analytics.userPerformance.workEfficiency.speedRating || 0) / 5)}
          />
          <InfoRow 
            label="Đánh giá độ chính xác" 
            value={`${analytics.userPerformance.workEfficiency.accuracyRating || 0}/5 ⭐`}
            valueColor={getRatingColor((analytics.userPerformance.workEfficiency.accuracyRating || 0) / 5)}
          />
          <InfoRow 
            label="Đánh giá tính nhất quán" 
            value={`${analytics.userPerformance.workEfficiency.consistencyRating || 0}/5 ⭐`}
            valueColor={getRatingColor((analytics.userPerformance.workEfficiency.consistencyRating || 0) / 5)}
          />
          <InfoRow 
            label="Cải thiện tổng thể" 
            value={`+${(analytics.userPerformance.workEfficiency.overallImprovement || 0).toFixed(1)}%`}
            valueColor={theme.success}
          />
        </InfoCard>
      )}

      {analytics.userPerformance.motivation && (
        <InfoCard>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 10 }}>
            Động lực và thái độ:
          </Text>
          <InfoRow 
            label="Mức độ động lực" 
            value={`${analytics.userPerformance.motivation.motivationLevel || 0}/10`}
            valueColor={getRatingColor((analytics.userPerformance.motivation.motivationLevel || 0) / 10)}
          />
          <InfoRow 
            label="Mức độ thích thú" 
            value={`${analytics.userPerformance.motivation.enjoymentLevel || 0}/10`}
            valueColor={getRatingColor((analytics.userPerformance.motivation.enjoymentLevel || 0) / 10)}
          />
          <InfoRow 
            label="Mức độ tự tin" 
            value={`${analytics.userPerformance.motivation.confidenceLevel || 0}/10`}
            valueColor={getRatingColor((analytics.userPerformance.motivation.confidenceLevel || 0) / 10)}
          />
          <InfoRow 
            label="Mức độ căng thẳng" 
            value={`${analytics.userPerformance.motivation.stressLevel || 0}/10`}
            valueColor={getRatingColor(1 - (analytics.userPerformance.motivation.stressLevel || 0) / 10)}
          />
        </InfoCard>
      )}

      {analytics.userPerformance.workingHabits && (
        <InfoCard>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 10 }}>
            Thói quen làm việc:
          </Text>
          <InfoRow 
            label="Phong cách làm việc" 
            value={analytics.userPerformance.workingHabits.workingStyle === 'SYSTEMATIC' ? 'Có hệ thống' : 'Linh hoạt'} 
          />
          <InfoRow 
            label="Xu hướng lập kế hoạch" 
            value={analytics.userPerformance.workingHabits.planningTendency === 'PLANNED' ? 'Có kế hoạch' : 'Tự phát'} 
          />
          <InfoRow label="Thời gian ưa thích" value={analytics.userPerformance.workingHabits.preferredTimeOfDay || 'Không xác định'} />
        </InfoCard>
      )}
    </Section>
  );

  const renderLearningAnalysis = () => analytics?.learningAnalysis && (
    <Section title="Phân tích học tập" icon="📚">
      {analytics.learningAnalysis.experienceGained && (
        <InfoCard>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 10 }}>
            Kinh nghiệm đạt được:
          </Text>
          <InfoRow 
            label="Điểm kinh nghiệm nhận" 
            value={`+${analytics.learningAnalysis.experienceGained.xpEarned || 0} XP`}
            valueColor={theme.success}
          />
          <InfoRow label="Cấp độ hiện tại" value={analytics.learningAnalysis.experienceGained.levelAfter || 1} />
          <InfoRow 
            label="Tiến độ cấp độ" 
            value={formatPercentile(analytics.learningAnalysis.experienceGained.progressInCurrentLevel || 0)}
            valueColor={getRatingColor((analytics.learningAnalysis.experienceGained.progressInCurrentLevel || 0) / 100)}
          />
          <InfoRow label="Điểm cần để lên cấp" value={analytics.learningAnalysis.experienceGained.pointsToNextLevel || 0} />
          <InfoRow label="Thời gian dự kiến lên cấp" value={`${analytics.learningAnalysis.experienceGained.estimatedTimeToNextLevel || 0} hoạt động`} />
        </InfoCard>
      )}

      {analytics.learningAnalysis.skillDevelopment && (
        <InfoCard>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 10 }}>
            Phát triển kỹ năng:
          </Text>
          <InfoRow 
            label="Thay đổi trình độ chuyên môn" 
            value={`+${analytics.learningAnalysis.skillDevelopment.expertiseLevelChange || 0}%`}
            valueColor={theme.success}
          />
        </InfoCard>
      )}
    </Section>
  );

  const renderActivityPatterns = () => analytics?.activityPatterns && (
    <Section title="Mẫu hoạt động" icon="📈">
      {analytics.activityPatterns.frequency && (
        <InfoCard>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 10 }}>
            Tần suất thực hiện:
          </Text>
          <InfoRow label="Tần suất hàng ngày" value={`${(analytics.activityPatterns.frequency.dailyFrequency || 0).toFixed(1)} lần/ngày`} />
          <InfoRow label="Tần suất hàng tuần" value={`${(analytics.activityPatterns.frequency.weeklyFrequency || 0).toFixed(1)} lần/tuần`} />
          <InfoRow label="Tần suất hàng tháng" value={`${analytics.activityPatterns.frequency.monthlyFrequency || 0} lần/tháng`} />
          <InfoRow label="Khoảng cách trung bình" value={`${(analytics.activityPatterns.frequency.averageIntervalDays || 0).toFixed(1)} ngày`} />
          <InfoRow label="Ngày từ lần cuối" value={`${analytics.activityPatterns.frequency.daysSinceLastSameActivity || 0} ngày`} />
          <InfoRow 
            label="Đánh giá tần suất" 
            value={analytics.activityPatterns.frequency.frequencyRating === 'OPTIMAL' ? 'Tối ưu' : 'Cần điều chỉnh'}
            valueColor={analytics.activityPatterns.frequency.frequencyRating === 'OPTIMAL' ? theme.success : theme.warning}
          />
        </InfoCard>
      )}

      {analytics.activityPatterns.frequency?.nextRecommendedDate && (
        <InfoCard>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 10 }}>
            Lịch trình được đề xuất:
          </Text>
          <InfoRow label="Lần tiếp theo nên thực hiện" value={new Date(analytics.activityPatterns.frequency.nextRecommendedDate).toLocaleDateString('vi-VN')} />
          <InfoRow label="Tần suất được đề xuất" value={`Mỗi ${analytics.activityPatterns.frequency.recommendedFrequency || 1} ngày`} />
        </InfoCard>
      )}
    </Section>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8
      }}>
        <View style={{
          backgroundColor: theme.surface,
          borderRadius: 16,
          padding: 24,
          width: '98%',
          maxHeight: '95%',
          minHeight: '80%'
        }}>
          {/* Header */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginBottom: 20,
            borderBottomWidth: 1,
            borderBottomColor: theme.outline,
            paddingBottom: 16
          }}>
            <Ionicons name="analytics-outline" size={28} color={theme.primary} />
            <Text style={{
              fontSize: 22,
              fontWeight: 'bold',
              color: theme.text,
              marginLeft: 12,
              flex: 1
            }}>
              Phân tích hoạt động chi tiết
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Loading State */}
            {loading && (
              <View style={{ alignItems: 'center', padding: 50 }}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={{ marginTop: 20, color: theme.textSecondary, textAlign: 'center', fontSize: 16 }}>
                  Đang phân tích hoạt động...
                </Text>
              </View>
            )}

            {/* No Data State */}
            {!loading && !analytics && (
              <View style={{ alignItems: 'center', padding: 50 }}>
                <Ionicons name="alert-circle-outline" size={56} color={theme.error} />
                <Text style={{ 
                  color: theme.textSecondary, 
                  textAlign: 'center', 
                  lineHeight: 24,
                  marginTop: 20,
                  fontSize: 16
                }}>
                  Không thể tải dữ liệu phân tích hoạt động.
                  {'\n\n'}Vui lòng thử lại sau.
                </Text>
              </View>
            )}

            {/* Analytics Data */}
            {!loading && analytics && (
              <View>
                {renderBasicInfo()}
                {renderGardenInfo()}
                {renderGardenerInfo()}
                {renderExecutionDetails()}
                {renderEffectivenessAnalysis()}
                {renderUserPerformance()}
                {renderLearningAnalysis()}
                {renderActivityPatterns()}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <TouchableOpacity
            style={{
              backgroundColor: theme.primary,
              paddingVertical: 16,
              paddingHorizontal: 24,
              borderRadius: 12,
              alignItems: 'center',
              marginTop: 20
            }}
            onPress={onClose}
          >
            <Text style={{
              color: '#FFFFFF',
              fontSize: 16,
              fontWeight: '600'
            }}>
              Đóng
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}; 