import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { GardenPlantDetails } from "@/types";

import PlantDetailCard from "@/components/garden/PlantDetailCard";
import {
  ConditionDetailStats,
  EnvironmentalAdviceItem,
  ImmediateAction,
  PlantAdviceData,
  RiskFactor,
  SensorConditionStats,
  PlantStatisticsData,
} from "@/types/plants/plant-insights.types";

// Helper component for styled list items or key-value pairs
const InfoRow: React.FC<{
  label: string;
  value: string | number | undefined;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor?: string;
  theme: ReturnType<typeof useAppTheme>;
  valueStyle?: object;
}> = ({ label, value, icon, iconColor, theme, valueStyle }) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return null; // Don't render if value is not meaningful
  }
  return (
    <View style={styles.infoRow}>
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={iconColor || theme.textSecondary}
          style={styles.infoRowIcon}
        />
      )}
      <Text style={[styles.infoRowLabel, { color: theme.textSecondary }]}>
        {label}:
      </Text>
      <Text
        style={[styles.infoRowValue, { color: theme.text }, valueStyle]}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {String(value)}
      </Text>
    </View>
  );
};

// Helper for displaying a card section
const SectionCard: React.FC<{
  title: string;
  children: React.ReactNode;
  theme: ReturnType<typeof useAppTheme>;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
}> = ({ title, children, theme, icon }) => (
  <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
    <View style={styles.sectionHeader}>
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={22}
          color={theme.primary}
          style={styles.sectionHeaderIcon}
        />
      )}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
    </View>
    {children}
  </View>
);

// Helper for Risk Factors
const RiskFactorItem: React.FC<{
  risk: RiskFactor;
  theme: ReturnType<typeof useAppTheme>;
}> = ({ risk, theme }) => {
  let iconName: keyof typeof MaterialCommunityIcons.glyphMap =
    "alert-circle-outline";
  let iconColor = theme.warning;
  if (risk.impact === "High") {
    iconName = "alert-octagon-outline";
    iconColor = theme.error;
  } else if (risk.impact === "Low") {
    iconName = "information-outline";
    iconColor = theme.info;
  }

  return (
    <View
      style={[
        styles.listItem,
        { borderLeftColor: iconColor, backgroundColor: theme.background },
      ]}
    >
      <View style={styles.listItemHeader}>
        <MaterialCommunityIcons
          name={iconName}
          size={20}
          color={iconColor}
          style={styles.listItemIcon}
        />
        <Text style={[styles.listItemTitle, { color: theme.text }]}>
          {risk.type} - Tác động: {risk.impact}
        </Text>
      </View>
      <Text
        style={[styles.listItemDescription, { color: theme.textSecondary }]}
      >
        {risk.description}
      </Text>
      <InfoRow
        label="Khuyến nghị"
        value={risk.recommendation}
        icon="medical-bag"
        theme={theme}
        valueStyle={{ fontStyle: "italic" }}
      />
    </View>
  );
};

// Helper for Immediate Actions
const ImmediateActionItem: React.FC<{
  action: ImmediateAction;
  theme: ReturnType<typeof useAppTheme>;
}> = ({ action, theme }) => {
  let iconName: keyof typeof MaterialCommunityIcons.glyphMap =
    "play-circle-outline";
  let borderColor = theme.info;
  if (action.priority === "HIGH") {
    iconName = "alert-box-outline";
    borderColor = theme.error;
  } else if (action.priority === "MEDIUM") {
    iconName = "information-outline";
    borderColor = theme.warning;
  }

  return (
    <View
      style={[
        styles.listItem,
        {
          borderLeftColor: borderColor,
          backgroundColor: theme.background,
        },
      ]}
    >
      <View style={styles.listItemHeader}>
        <MaterialCommunityIcons
          name={iconName}
          size={20}
          color={borderColor}
          style={styles.listItemIcon}
        />
        <Text style={[styles.listItemTitle, { color: theme.text }]}>
          {action.title} (Ưu tiên: {action.priority})
        </Text>
      </View>
      <Text
        style={[styles.listItemDescription, { color: theme.textSecondary }]}
      >
        {action.description}
      </Text>
      <InfoRow
        label="Khung thời gian"
        value={action.timeFrame}
        icon="clock-fast"
        theme={theme}
      />
      <InfoRow
        label="Lý do"
        value={action.reason}
        icon="comment-question-outline"
        theme={theme}
      />
    </View>
  );
};

const getStatusStyle = (
  status: string | undefined,
  theme: ReturnType<typeof useAppTheme>
) => {
  if (!status)
    return {
      color: theme.textSecondary,
      icon: "information-outline" as keyof typeof MaterialCommunityIcons.glyphMap,
    };
  const s = status.toLowerCase();
  if (s.includes("tốt") || s.includes("healthy") || s.includes("optimal")) {
    return {
      color: theme.success,
      icon: "check-circle-outline" as keyof typeof MaterialCommunityIcons.glyphMap,
    };
  }
  if (
    s.includes("trung bình") ||
    s.includes("fair") ||
    s.includes("attention") ||
    s.includes("moderate") ||
    s.includes("medium")
  ) {
    return {
      color: theme.warning,
      icon: "alert-circle-outline" as keyof typeof MaterialCommunityIcons.glyphMap,
    };
  }
  if (
    s.includes("kém") ||
    s.includes("poor") ||
    s.includes("critical") ||
    s.includes("bad") ||
    s.includes("high")
  ) {
    return {
      color: theme.error,
      icon: "alert-octagon-outline" as keyof typeof MaterialCommunityIcons.glyphMap,
    };
  }
  if (s.includes("low")) {
    return {
      color: theme.info,
      icon: "information-outline" as keyof typeof MaterialCommunityIcons.glyphMap,
    };
  }
  return {
    color: theme.textSecondary,
    icon: "information-outline" as keyof typeof MaterialCommunityIcons.glyphMap,
  };
};

interface GardenPlantTabProps {
  plantDetails?: GardenPlantDetails;
  plantStats: PlantStatisticsData | null;
  plantDetailedAdvice: PlantAdviceData | null;
  plantStatsLoading: boolean;
  plantDetailedAdviceLoading: boolean;
}

const GardenPlantTab: React.FC<GardenPlantTabProps> = ({
  plantDetails,
  plantStats,
  plantDetailedAdvice,
  plantStatsLoading,
  plantDetailedAdviceLoading,
}) => {
  const theme = useAppTheme();

  if (plantStatsLoading || plantDetailedAdviceLoading) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Đang tải dữ liệu chi tiết cây trồng...
        </Text>
      </View>
    );
  }

  if (!plantDetails && !plantStats && !plantDetailedAdvice) {
    return (
      <View
        style={[
          styles.emptyPlantContainer,
          { backgroundColor: theme.background },
        ]}
      >
        <MaterialCommunityIcons
          name="flower-tulip-outline"
          size={48}
          color={theme.textSecondary}
        />
        <Text style={[styles.emptyPlantText, { color: theme.text }]}>
          Chưa có dữ liệu chi tiết
        </Text>
        <Text
          style={[styles.emptyPlantSubtext, { color: theme.textSecondary }]}
        >
          Không có thông tin thống kê hoặc lời khuyên cho cây trồng này.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContentContainer}
    >
      {/* Section: Plant Overview from Stats */}
      {plantStats?.gardenInfo && (
        <SectionCard
          title="Tổng Quan Cây Trồng"
          theme={theme}
          icon="information-outline"
        >
          <InfoRow
            label="Tên cây"
            value={plantStats.gardenInfo.plantName}
            icon="leaf"
            theme={theme}
          />
          <InfoRow
            label="Giai đoạn"
            value={plantStats.gardenInfo.plantGrowStage}
            icon="clipboard-text-outline"
            theme={theme}
          />
          <InfoRow
            label="Ngày trồng"
            value={new Date(
              plantStats.gardenInfo.plantStartDate
            ).toLocaleDateString("vi-VN")}
            icon="calendar-start"
            theme={theme}
          />
          <InfoRow
            label="Thời gian phát triển"
            value={`${plantStats.gardenInfo.plantDuration} ngày`}
            icon="clock-outline"
            theme={theme}
          />
          <InfoRow
            label="Ngày tuổi"
            value={`${plantStats.gardenInfo.daysFromPlanting} ngày`}
            icon="counter"
            theme={theme}
          />
          <InfoRow
            label="Còn lại"
            value={`${plantStats.gardenInfo.remainingDays} ngày`}
            icon="timelapse"
            theme={theme}
          />
          <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
            Tiến độ: {plantStats.gardenInfo.progressPercentage}%
          </Text>
          <View
            style={[
              styles.progressBarContainer,
              { backgroundColor: theme.borderLight },
            ]}
          >
            <View
              style={[
                styles.progressBar,
                {
                  width: `${plantStats.gardenInfo.progressPercentage}%`,
                  backgroundColor: theme.primary,
                },
              ]}
            />
          </View>
        </SectionCard>
      )}

      {/* Section: Plant Health from Stats */}
      {plantStats?.plantHealth && (
        <SectionCard
          title="Sức Khỏe Cây Trồng"
          theme={theme}
          icon="heart-pulse"
        >
          <InfoRow
            label="Điểm tổng thể"
            value={`${plantStats.plantHealth.overallScore}/100`}
            icon="star-circle-outline"
            theme={theme}
          />
          {(() => {
            const statusStyle = getStatusStyle(
              plantStats.plantHealth.healthStatus,
              theme
            );
            return (
              <InfoRow
                label="Trạng thái"
                value={plantStats.plantHealth.healthStatus}
                icon={statusStyle.icon}
                iconColor={statusStyle.color}
                theme={theme}
                valueStyle={{
                  color: statusStyle.color,
                  fontFamily: "Inter-SemiBold",
                }}
              />
            );
          })()}
          {Object.entries(plantStats.plantHealth.conditions).map(
            ([key, condition]: [string, ConditionDetailStats]) => {
              const statusStyle = getStatusStyle(condition.status, theme);
              const unit = condition.unit || "";
              const conditionKey = key.replace(/_/g, " "); // Replace underscores for display

              return (
                <View
                  key={key}
                  style={[
                    styles.conditionDetailItem,
                    {
                      borderColor: theme.borderLight,
                      backgroundColor: theme.background,
                      borderLeftColor: statusStyle.color,
                    },
                  ]}
                >
                  <Text style={[styles.conditionTitle, { color: theme.text }]}>
                    {conditionKey.charAt(0).toUpperCase() +
                      conditionKey.slice(1)}
                  </Text>
                  <InfoRow
                    label="Hiện tại"
                    value={`${condition.current}${unit}`}
                    icon="current-ac" // Consider more specific icons based on 'key'
                    theme={theme}
                  />
                  <InfoRow
                    label="Tối ưu"
                    value={`${condition.optimal.min}${unit} - ${condition.optimal.max}${unit}`}
                    icon="target"
                    theme={theme}
                  />
                  <InfoRow
                    label="Trạng thái"
                    value={condition.status}
                    icon={statusStyle.icon}
                    iconColor={statusStyle.color}
                    theme={theme}
                    valueStyle={{
                      color: statusStyle.color,
                      fontFamily: "Inter-Medium",
                    }}
                  />
                  <InfoRow
                    label="Điểm"
                    value={`${condition.score}/100`}
                    icon="star-outline"
                    theme={theme}
                  />
                </View>
              );
            }
          )}
        </SectionCard>
      )}

      {/* Section: Current Conditions from Stats */}
      {plantStats?.currentConditions && (
        <SectionCard
          title="Điều Kiện Hiện Tại"
          theme={theme}
          icon="thermometer-lines"
        >
          <Text style={[styles.subSectionTitle, { color: theme.text }]}>
            <MaterialCommunityIcons
              name="access-point"
              size={16}
              color={theme.primary}
              style={{ marginRight: 5 }}
            />
            Cảm biến
          </Text>
          {plantStats.currentConditions.sensors.map(
            (sensor: SensorConditionStats) => {
              const statusStyle = getStatusStyle(sensor.status, theme);
              let sensorIcon: keyof typeof MaterialCommunityIcons.glyphMap =
                "gauge-empty";
              if (sensor.name.toLowerCase().includes("temp"))
                sensorIcon = "thermometer";
              if (
                sensor.name.toLowerCase().includes("ẩm") ||
                sensor.name.toLowerCase().includes("moisture")
              )
                sensorIcon = "water-percent";
              if (sensor.name.toLowerCase().includes("ph"))
                sensorIcon = "alpha-p-box-outline";
              if (
                sensor.name.toLowerCase().includes("sáng") ||
                sensor.name.toLowerCase().includes("light")
              )
                sensorIcon = "brightness-5";

              return (
                <InfoRow
                  key={sensor.id}
                  label={sensor.name}
                  value={`${sensor.currentValue} ${sensor.unit}`}
                  icon={sensorIcon}
                  iconColor={statusStyle.color} // Color icon by status
                  theme={theme}
                  valueStyle={{ color: statusStyle.color }}
                />
              );
            }
          )}
          <Text
            style={[
              styles.subSectionTitle,
              { color: theme.text, marginTop: 20, marginBottom: 5 },
            ]}
          >
            <MaterialCommunityIcons
              name="weather-sunny"
              size={16}
              color={theme.primary}
              style={{ marginRight: 5 }}
            />
            Thời tiết
          </Text>
          <InfoRow
            label="Nhiệt độ"
            value={`${plantStats.currentConditions.weather.current.temp}°C`}
            icon="thermometer"
            theme={theme}
          />
          <InfoRow
            label="Độ ẩm"
            value={`${plantStats.currentConditions.weather.current.humidity}%`}
            icon="water-percent"
            theme={theme}
          />
          <InfoRow
            label="Mô tả"
            value={plantStats.currentConditions.weather.current.weatherDesc}
            icon="weather-cloudy"
            theme={theme}
          />
        </SectionCard>
      )}

      {/* Section: Key Predictions from Stats */}
      {plantStats?.predictions && (
        <SectionCard title="Dự Đoán Quan Trọng" theme={theme} icon="chart-line">
          <InfoRow
            label="Lần tưới tiếp theo"
            value={new Date(
              plantStats.predictions.nextWateringSchedule
            ).toLocaleString("vi-VN", {
              dateStyle: "short",
              timeStyle: "short",
            })}
            icon="water-pump"
            theme={theme}
          />
          <InfoRow
            label="Ngày thu hoạch dự kiến"
            value={new Date(
              plantStats.predictions.estimatedHarvestDate
            ).toLocaleDateString("vi-VN")}
            icon="calendar-check-outline"
            theme={theme}
          />
          <InfoRow
            label="Sản lượng dự kiến"
            value={plantStats.predictions.expectedYield}
            icon="basket-outline"
            theme={theme}
          />
          <Text
            style={[
              styles.subSectionTitle,
              { color: theme.text, marginTop: 15, marginBottom: 5 },
            ]}
          >
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={16}
              color={theme.warning}
              style={{ marginRight: 5 }}
            />
            Yếu Tố Rủi Ro ({plantStats.predictions.riskFactors.length}):
          </Text>
          {plantStats.predictions.riskFactors.length > 0 ? (
            plantStats.predictions.riskFactors
              .slice(0, 3) // Show max 3 initially
              .map((risk: RiskFactor, index: number) => (
                <RiskFactorItem key={index} risk={risk} theme={theme} />
              ))
          ) : (
            <Text style={[styles.noDataText, { color: theme.textSecondary }]}>
              Không có yếu tố rủi ro nào được ghi nhận.
            </Text>
          )}
        </SectionCard>
      )}

      {/* Section: Immediate Actions from Advice */}
      {plantDetailedAdvice?.immediateActions &&
        plantDetailedAdvice.immediateActions.length > 0 && (
          <SectionCard
            title="Hành Động Khẩn Cấp"
            theme={theme}
            icon="alert-decagram-outline"
          >
            {plantDetailedAdvice.immediateActions.map(
              (action: ImmediateAction, index: number) => (
                <ImmediateActionItem
                  key={index}
                  action={action}
                  theme={theme}
                />
              )
            )}
          </SectionCard>
        )}

      {/* Section: Overall Assessment from Advice */}
      {plantDetailedAdvice?.overallAssessment && (
        <SectionCard
          title="Đánh Giá Tổng Quan (Lời khuyên)"
          theme={theme}
          icon="text-search"
        >
          {(() => {
            const statusStyle = getStatusStyle(
              plantDetailedAdvice.overallAssessment.status,
              theme
            );
            return (
              <>
                <InfoRow
                  label="Điểm sức khỏe"
                  value={plantDetailedAdvice.overallAssessment.healthScore}
                  icon="star-circle-outline"
                  theme={theme}
                />
                <InfoRow
                  label="Trạng thái"
                  value={plantDetailedAdvice.overallAssessment.status}
                  icon={statusStyle.icon}
                  iconColor={statusStyle.color}
                  theme={theme}
                  valueStyle={{
                    color: statusStyle.color,
                    fontFamily: "Inter-SemiBold",
                  }}
                />
              </>
            );
          })()}
          <Text style={[styles.summaryText, { color: theme.textSecondary }]}>
            {plantDetailedAdvice.overallAssessment.summary}
          </Text>
        </SectionCard>
      )}

      {/* Section: Care Recommendations from Advice */}
      {plantDetailedAdvice?.careRecommendations && (
        <SectionCard
          title="Khuyến Nghị Chăm Sóc"
          theme={theme}
          icon="clipboard-list-outline"
        >
          <Text style={[styles.subSectionTitle, { color: theme.text }]}>
            <MaterialCommunityIcons
              name="water-outline"
              size={16}
              color={theme.primary}
              style={{ marginRight: 5 }}
            />{" "}
            Tưới Nước
          </Text>
          <InfoRow
            label="Lịch tới"
            value={new Date(
              plantDetailedAdvice.careRecommendations.watering.nextSchedule
            ).toLocaleString("vi-VN", {
              dateStyle: "short",
              timeStyle: "short",
            })}
            icon="calendar-clock"
            theme={theme}
          />
          <InfoRow
            label="Tần suất"
            value={plantDetailedAdvice.careRecommendations.watering.frequency}
            icon="sync"
            theme={theme}
          />
          <InfoRow
            label="Lượng"
            value={plantDetailedAdvice.careRecommendations.watering.amount}
            icon="cup-water"
            theme={theme}
          />
          {plantDetailedAdvice.careRecommendations.watering.tips
            .slice(0, 2) // Show max 2 tips
            .map((tip: string, i: number) => (
              <View key={i} style={styles.tipItem}>
                <MaterialCommunityIcons
                  name="lightbulb-on-outline"
                  size={14}
                  color={theme.info}
                  style={styles.tipIcon}
                />
                <Text style={[styles.tipText, { color: theme.text }]}>
                  {tip}
                </Text>
              </View>
            ))}

          <Text
            style={[
              styles.subSectionTitle,
              { color: theme.text, marginTop: 20 },
            ]}
          >
            <MaterialCommunityIcons
              name="flower-tulip-outline"
              size={16}
              color={theme.primary}
              style={{ marginRight: 5 }}
            />{" "}
            Bón Phân
          </Text>
          <InfoRow
            label="Lịch tới"
            value={new Date(
              plantDetailedAdvice.careRecommendations.fertilizing.nextSchedule
            ).toLocaleString("vi-VN", {
              dateStyle: "short",
              timeStyle: "short",
            })}
            icon="calendar-clock"
            theme={theme}
          />
          <InfoRow
            label="Loại"
            value={plantDetailedAdvice.careRecommendations.fertilizing.type}
            icon="flask-outline"
            theme={theme}
          />
          {plantDetailedAdvice.careRecommendations.fertilizing.amount && (
            <InfoRow
              label="Lượng"
              value={plantDetailedAdvice.careRecommendations.fertilizing.amount}
              icon="scale-balance"
              theme={theme}
            />
          )}
          {plantDetailedAdvice.careRecommendations.fertilizing.tips
            .slice(0, 2) // Show max 2 tips
            .map((tip: string, i: number) => (
              <View key={i} style={styles.tipItem}>
                <MaterialCommunityIcons
                  name="lightbulb-on-outline"
                  size={14}
                  color={theme.info}
                  style={styles.tipIcon}
                />
                <Text style={[styles.tipText, { color: theme.text }]}>
                  {tip}
                </Text>
              </View>
            ))}

          <Text
            style={[
              styles.subSectionTitle,
              { color: theme.text, marginTop: 20 },
            ]}
          >
            <MaterialCommunityIcons
              name="bug-outline"
              size={16}
              color={theme.primary}
              style={{ marginRight: 5 }}
            />{" "}
            Sâu Bệnh
          </Text>
          {(() => {
            const riskLevel =
              plantDetailedAdvice.careRecommendations.pest_control.riskLevel;
            const statusStyle = getStatusStyle(riskLevel, theme);
            return (
              <InfoRow
                label="Mức độ rủi ro"
                value={riskLevel}
                icon={statusStyle.icon}
                iconColor={statusStyle.color}
                theme={theme}
                valueStyle={{
                  color: statusStyle.color,
                  fontFamily: "Inter-SemiBold",
                }}
              />
            );
          })()}
          {plantDetailedAdvice.careRecommendations.pest_control.detectedPests &&
            plantDetailedAdvice.careRecommendations.pest_control.detectedPests
              .length > 0 && (
              <InfoRow
                label="Sâu bệnh phát hiện"
                value={plantDetailedAdvice.careRecommendations.pest_control.detectedPests.join(
                  ", "
                )}
                icon="magnify-scan"
                theme={theme}
              />
            )}
          <Text
            style={[
              styles.infoTextSmallLabel, // Changed style name for clarity
              { color: theme.textSecondary, marginBottom: 5, marginTop: 10 },
            ]}
          >
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={13}
              color={theme.textSecondary}
              style={{ marginRight: 3 }}
            />{" "}
            Phòng ngừa:
          </Text>
          {plantDetailedAdvice.careRecommendations.pest_control.prevention
            .slice(0, 2) // Show max 2
            .map((p: string, i: number) => (
              <View key={i} style={styles.tipItem}>
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={14}
                  color={theme.success}
                  style={styles.tipIcon}
                />
                <Text style={[styles.tipText, { color: theme.text }]}>{p}</Text>
              </View>
            ))}
          {plantDetailedAdvice.careRecommendations.pest_control.treatment &&
            plantDetailedAdvice.careRecommendations.pest_control.treatment
              .length > 0 && (
              <>
                <Text
                  style={[
                    styles.infoTextSmallLabel, // Changed style name for clarity
                    {
                      color: theme.textSecondary,
                      marginBottom: 5,
                      marginTop: 10,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="medical-bag"
                    size={13}
                    color={theme.textSecondary}
                    style={{ marginRight: 3 }}
                  />{" "}
                  Điều trị:
                </Text>
                {plantDetailedAdvice.careRecommendations.pest_control.treatment
                  .slice(0, 2) // Show max 2
                  .map((t: string, i: number) => (
                    <View key={i} style={styles.tipItem}>
                      <MaterialCommunityIcons
                        name="spray-bottle"
                        size={14}
                        color={theme.warning}
                        style={styles.tipIcon}
                      />
                      <Text style={[styles.tipText, { color: theme.text }]}>
                        {t}
                      </Text>
                    </View>
                  ))}
              </>
            )}
        </SectionCard>
      )}

      {/* Section: Environmental Advice */}
      {plantDetailedAdvice?.environmentalAdvice && (
        <SectionCard title="Lời Khuyên Môi Trường" theme={theme} icon="earth">
          {Object.entries(plantDetailedAdvice.environmentalAdvice).map(
            ([key, advice]: [string, EnvironmentalAdviceItem]) => {
              const statusStyle = getStatusStyle(advice.status, theme);
              let adviceIconName: keyof typeof MaterialCommunityIcons.glyphMap =
                "help-circle-outline";
              const adviceKey = key.replace(/_/g, " "); // Replace underscores for display

              if (key.toLowerCase().includes("temp"))
                adviceIconName = "thermometer";
              if (key.toLowerCase().includes("humid"))
                adviceIconName = "water-percent";
              if (key.toLowerCase().includes("light"))
                adviceIconName = "white-balance-sunny";
              if (
                key.toLowerCase().includes("soil_ph") ||
                key.toLowerCase().includes("ph")
              )
                adviceIconName = "alpha-p-box-outline";

              return (
                <View
                  key={key}
                  style={[
                    styles.envAdviceItem,
                    {
                      borderLeftColor: statusStyle.color,
                      backgroundColor: theme.background,
                    },
                  ]}
                >
                  <View style={styles.envAdviceHeader}>
                    <MaterialCommunityIcons
                      name={adviceIconName}
                      size={18}
                      color={theme.primary}
                      style={styles.envAdviceIcon}
                    />
                    <Text
                      style={[styles.envAdviceTitle, { color: theme.text }]}
                    >
                      {adviceKey.charAt(0).toUpperCase() + adviceKey.slice(1)}
                    </Text>
                  </View>
                  <InfoRow
                    label="Trạng thái"
                    value={advice.status}
                    icon={statusStyle.icon}
                    iconColor={statusStyle.color}
                    theme={theme}
                    valueStyle={{
                      color: statusStyle.color,
                      fontFamily: "Inter-Medium",
                    }}
                  />
                  <InfoRow
                    label="Hiện tại"
                    value={advice.current}
                    icon="gauge"
                    theme={theme}
                  />
                  {advice.optimalRange && (
                    <InfoRow
                      label="Tối ưu"
                      value={advice.optimalRange}
                      icon="target"
                      theme={theme}
                    />
                  )}
                  {advice.optimal &&
                    !advice.optimalRange && ( // Show optimal only if optimalRange is not present
                      <InfoRow
                        label="Tối ưu"
                        value={advice.optimal}
                        icon="target"
                        theme={theme}
                      />
                    )}
                  <View
                    style={[
                      styles.adviceTextContainer,
                      {
                        backgroundColor:
                          theme.background === theme.card
                            ? theme.background
                            : theme.card,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="information-outline"
                      size={16}
                      color={theme.info}
                      style={styles.adviceIcon}
                    />
                    <Text style={[styles.tipText, { color: theme.text }]}>
                      {advice.advice}
                    </Text>
                  </View>
                </View>
              );
            }
          )}
        </SectionCard>
      )}

      {/* Fallback for basic plantDetails if new data is missing */}
      {plantDetails && !plantStats && !plantDetailedAdvice && (
        <PlantDetailCard
          plantDetails={plantDetails}
          onViewFullDetails={() => {}} // Add navigation if needed
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingVertical: 16, // Add vertical padding for scroll ends
    paddingHorizontal: 12, // Adjust horizontal padding
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    marginTop: 12,
  },
  emptyPlantContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    minHeight: 300,
  },
  emptyPlantText: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    marginTop: 16,
    textAlign: "center",
  },
  emptyPlantSubtext: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  sectionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000000", // Explicit black for shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, // Slightly more subtle shadow
    shadowRadius: 4, // Slightly smaller shadow radius
    elevation: 3,
    borderWidth: 1, // Add a light border to cards
    // borderColor: theme.borderLight, // Use theme color for border
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16, // More space after header
  },
  sectionHeaderIcon: {
    marginRight: 10, // More space for icon
  },
  sectionTitle: {
    fontSize: 20, // Larger section title
    fontFamily: "Inter-Bold",
    flexShrink: 1, // Allow title to wrap if very long
  },
  subSectionTitle: {
    fontSize: 17, // Slightly larger sub-section title
    fontFamily: "Inter-SemiBold",
    marginBottom: 10,
    marginTop: 10, // Consistent margin
    flexDirection: "row",
    alignItems: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    flexWrap: "nowrap",
  },
  infoRowIcon: {
    marginRight: 10,
    marginTop: 3, // Fine-tune icon alignment
  },
  infoRowLabel: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    marginRight: 8, // More space for label
    minWidth: 90, // Ensure label has enough space
    color: "#666666", // Slightly muted label color (example)
  },
  infoRowValue: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    flexShrink: 1,
    textAlign: "left",
  },
  progressLabel: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    marginBottom: 6, // More space before bar
    marginTop: 12, // More space after info rows
  },
  progressBarContainer: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    marginTop: 4,
  },
  progressBar: {
    height: "100%",
    borderRadius: 5,
  },
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 5,
  },
  listItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8, // Space between header and description
  },
  listItemIcon: {
    marginRight: 10, // More space for icon
  },
  listItemTitle: {
    fontSize: 16, // Slightly larger title
    fontFamily: "Inter-SemiBold",
    flexShrink: 1, // Allow title to wrap
  },
  listItemDescription: {
    fontSize: 14, // Slightly larger description
    fontFamily: "Inter-Regular",
    marginBottom: 8,
    lineHeight: 20, // Better line height for readability
    marginLeft: 30, // Indent description further (icon size + margin)
  },
  infoTextSmallLabel: {
    // New style for labels like "Phòng ngừa:"
    fontSize: 14,
    fontFamily: "Inter-Medium",
    lineHeight: 18,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8, // Add some top margin
  },
  summaryText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    lineHeight: 21,
    marginTop: 8,
    fontStyle: "italic",
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 4, // More vertical space for tips
    marginLeft: 8,
  },
  tipIcon: {
    marginRight: 8, // More space for icon
    marginTop: 3, // Align icon with text
  },
  tipText: {
    fontSize: 14, // Slightly larger tip text
    fontFamily: "Inter-Regular",
    lineHeight: 20, // Better line height
    flexShrink: 1,
  },
  conditionDetailItem: {
    paddingTop: 12,
    marginTop: 12,
    paddingBottom: 8, // Adjusted padding
    paddingLeft: 12, // Adjusted padding
    borderLeftWidth: 4,
    borderRadius: 8, // Slightly more rounded
    borderTopWidth: 1, // Keep top border if needed for separation
    // borderColor already set inline by status
  },
  conditionTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    marginBottom: 10, // More space after title
  },
  envAdviceItem: {
    marginBottom: 16,
    paddingVertical: 12, // More vertical padding
    paddingHorizontal: 12, // More horizontal padding
    borderLeftWidth: 4,
    borderRadius: 8, // Slightly more rounded
    // borderLeftColor already set by status
    // backgroundColor already set by theme.background
  },
  envAdviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10, // More space after header
  },
  envAdviceIcon: {
    marginRight: 10, // More space for icon
  },
  envAdviceTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    flexShrink: 1, // Allow title to wrap
  },
  adviceTextContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8, // More space before advice text
    padding: 10, // Add padding to container
    borderRadius: 6,
    // backgroundColor will be set dynamically
  },
  adviceIcon: {
    marginRight: 8, // More space for icon
    marginTop: 3, // Align icon with text
  },
  noDataText: {
    fontSize: 14,
    fontFamily: "Inter-Italic",
    marginVertical: 10,
    textAlign: "center",
  },
});

export default GardenPlantTab;
