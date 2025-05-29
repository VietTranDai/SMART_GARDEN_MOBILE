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
import {
  ConditionDetailStats,
  EnvironmentalAdviceItem,
  ImmediateAction,
  PlantAdviceData,
  RiskFactor,
  SensorConditionStats,
  PlantStatisticsData,
} from "@/types/plants/plant-insights.types";

// --- Localization Helpers ---
const translateConditionKey = (key: string): string => {
  const lowerKey = key.toLowerCase();
  if (lowerKey.includes("temperature")) return "Nhiệt độ";
  if (lowerKey.includes("humidity")) return "Độ ẩm";
  if (lowerKey.includes("soil_moisture") || lowerKey.includes("soil moisture"))
    return "Độ ẩm đất";
  if (
    lowerKey.includes("light_exposure") ||
    lowerKey.includes("light exposure") ||
    lowerKey.includes("light")
  )
    return "Ánh sáng";
  if (lowerKey.includes("soil_ph") || lowerKey.includes("ph"))
    return "Độ pH đất";
  return key.charAt(0).toUpperCase() + key.slice(1); // Default fallback
};

const translateSensorNameIfNeeded = (name?: string): string => {
  if (!name) return "Không có tên";
  const lowerName = name.toLowerCase();

  // Specific known sensor names
  if (
    lowerName.includes("temperature sensor") ||
    lowerName.includes("nhiệt kế")
  )
    return "Cảm biến Nhiệt độ";
  if (
    lowerName.includes("humidity sensor") ||
    lowerName.includes("cảm biến độ ẩm")
  )
    return "Cảm biến Độ ẩm";
  if (
    lowerName.includes("soil moisture sensor") ||
    lowerName.includes("cảm biến độ ẩm đất")
  )
    return "Cảm biến Độ ẩm đất";
  if (
    lowerName.includes("light sensor") ||
    lowerName.includes("cảm biến ánh sáng")
  )
    return "Cảm biến Ánh sáng";
  if (lowerName.includes("ph sensor") || lowerName.includes("cảm biến ph"))
    return "Cảm biến pH";

  // General terms
  let translatedName = name;
  translatedName = translatedName.replace(/temperature/gi, "Nhiệt độ");
  translatedName = translatedName.replace(/humidity/gi, "Độ ẩm");
  translatedName = translatedName.replace(/soil moisture/gi, "Độ ẩm đất");
  translatedName = translatedName.replace(
    /light intensity/gi,
    "Cường độ ánh sáng"
  );
  translatedName = translatedName.replace(/light/gi, "Ánh sáng");
  translatedName = translatedName.replace(/sensor/gi, "Cảm biến");
  translatedName = translatedName.replace(/ph/gi, "pH");

  // Capitalize first letter of each word if not already.
  return translatedName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const translateUnitIfNeeded = (unit?: string): string => {
  if (!unit) return "";
  const lowerUnit = unit.toLowerCase();

  // Common units and their symbols/Vietnamese equivalents from SensorUnit enum and general usage
  if (
    lowerUnit === "celsius" ||
    lowerUnit === "degree celsius" ||
    lowerUnit === "degrees celsius"
  )
    return "°C";
  if (
    lowerUnit === "fahrenheit" ||
    lowerUnit === "degree fahrenheit" ||
    lowerUnit === "degrees fahrenheit"
  )
    return "°F";
  if (lowerUnit === "percent" || lowerUnit === "percentage") return "%";
  if (lowerUnit === "lux") return "lux";
  if (lowerUnit === "ph") return "pH"; // Handles "PH" from enum
  if (lowerUnit === "liter" || lowerUnit === "litre") return "L"; // Handles LITER
  if (lowerUnit === "meter" || lowerUnit === "metre") return "m"; // Handles METER
  if (lowerUnit === "millimeter" || lowerUnit === "millimetre") return "mm"; // Handles MILLIMETER
  if (lowerUnit === "hpa") return "hPa"; // hectopascal, standard

  // Fallback for already symbolic units or less common ones not covered above
  // This check might be redundant if the above covers all direct enum inputs as lowercase strings
  // but can be useful if the direct input might already be a symbol.
  if (
    unit === "°C" ||
    unit === "%" ||
    unit === "pH" ||
    unit === "L" ||
    unit === "m" ||
    unit === "mm" ||
    unit === "lux" ||
    unit === "hPa"
  )
    return unit;

  return unit; // Default to returning the original unit if no specific translation matches
};

const translateStatus = (status?: string): string => {
  if (!status) return "Không xác định";
  const s = status.toLowerCase();
  // General statuses
  if (s === "optimal" || s === "good" || s === "healthy" || s === "tốt")
    return "Tốt";
  if (
    s === "fair" ||
    s === "average" ||
    s === "moderate" ||
    s === "medium" ||
    s === "trung bình"
  )
    return "Trung bình";
  if (s === "poor" || s === "bad" || s === "kém") return "Kém";
  if (s === "critical" || s === "very bad") return "Rất xấu";
  // Ensure API specific values like NEEDS_ATTENTION are caught
  if (s === "attention needed" || s === "needs_attention" || s === "attention")
    return "Cần chú ý";
  if (s === "stable") return "Ổn định";
  if (s === "rising") return "Đang tăng";
  if (s === "falling") return "Đang giảm";
  // Removed duplicate: if (s === "good") return "Tốt";

  // Specific for advice/risk
  if (s === "high") return "Cao";
  // "medium" is already covered by general statuses, but explicit here is fine for clarity if needed.
  if (s === "low") return "Thấp";

  return status.charAt(0).toUpperCase() + status.slice(1); // Default fallback
};

const translatePriority = (priority?: string): string => {
  if (!priority) return "Không xác định";
  const p = priority.toLowerCase();
  if (p === "high") return "Cao";
  if (p === "medium") return "Trung bình";
  if (p === "low") return "Thấp";
  return priority;
};

const translateImpact = (impact?: string): string => {
  if (!impact) return "Không xác định";
  const i = impact.toLowerCase();
  if (i === "high") return "Cao";
  if (i === "medium") return "Trung bình";
  if (i === "low") return "Thấp";
  return impact;
};

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
    return null;
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
        numberOfLines={3} // Allow more lines for translated text
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
  const translatedImpact = translateImpact(risk.impact);
  const statusStyle = getStatusStyle(risk.impact, theme); // Use impact for styling cues

  return (
    <View
      style={[
        styles.listItem,
        {
          borderLeftColor: statusStyle.color,
          backgroundColor: theme.background,
        },
      ]}
    >
      <View style={styles.listItemHeader}>
        <MaterialCommunityIcons
          name={statusStyle.icon}
          size={20}
          color={statusStyle.color}
          style={styles.listItemIcon}
        />
        <Text style={[styles.listItemTitle, { color: theme.text }]}>
          {risk.type} - Tác động: {translatedImpact}
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
  const translatedPriority = translatePriority(action.priority);
  const statusStyle = getStatusStyle(action.priority, theme); // Use priority for styling

  return (
    <View
      style={[
        styles.listItem,
        {
          borderLeftColor: statusStyle.color,
          backgroundColor: theme.background,
        },
      ]}
    >
      <View style={styles.listItemHeader}>
        <MaterialCommunityIcons
          name={statusStyle.icon}
          size={20}
          color={statusStyle.color}
          style={styles.listItemIcon}
        />
        <Text style={[styles.listItemTitle, { color: theme.text }]}>
          {action.title} (Ưu tiên: {translatedPriority})
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
): { color: string; icon: keyof typeof MaterialCommunityIcons.glyphMap } => {
  // Explicit return type
  if (!status)
    return {
      color: theme.textSecondary,
      icon: "information-outline",
    };
  const s = status.toLowerCase();
  if (
    s.includes("tốt") ||
    s.includes("healthy") ||
    s.includes("optimal") ||
    s.includes("good")
  ) {
    return { color: theme.success, icon: "check-circle-outline" };
  }
  if (
    s.includes("trung bình") ||
    s.includes("fair") ||
    s.includes("average") ||
    s.includes("attention") ||
    s.includes("moderate") ||
    s.includes("medium")
  ) {
    return { color: theme.warning, icon: "alert-circle-outline" };
  }
  if (
    s.includes("kém") ||
    s.includes("poor") ||
    s.includes("critical") ||
    s.includes("bad") ||
    s.includes("high") ||
    s.includes("very bad")
  ) {
    return { color: theme.error, icon: "alert-octagon-outline" };
  }
  if (s.includes("low") || s.includes("thấp")) {
    return { color: theme.info, icon: "information-outline" };
  }
  if (s.includes("stable"))
    return { color: theme.info, icon: "check-decagram-outline" }; // Specific for stable
  if (s.includes("rising"))
    return { color: theme.warning, icon: "trending-up" };
  if (s.includes("falling"))
    return { color: theme.warning, icon: "trending-down" };

  return { color: theme.textSecondary, icon: "information-outline" };
};

interface GardenPlantTabProps {
  plantStats: PlantStatisticsData | null;
  plantDetailedAdvice: PlantAdviceData | null;
  plantStatsLoading: boolean;
  plantDetailedAdviceLoading: boolean;
}

const GardenPlantTab: React.FC<GardenPlantTabProps> = ({
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

  if (!plantStats && !plantDetailedAdvice) {
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
      showsVerticalScrollIndicator={false}
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
            const translatedStatus = translateStatus(
              plantStats.plantHealth.healthStatus
            );
            const statusStyle = getStatusStyle(
              plantStats.plantHealth.healthStatus,
              theme
            );
            return (
              <InfoRow
                label="Trạng thái"
                value={translatedStatus}
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
              const translatedCondStatus = translateStatus(condition.status);
              const statusStyle = getStatusStyle(condition.status, theme);
              const translatedUnit = translateUnitIfNeeded(condition.unit);
              const conditionDisplayKey = translateConditionKey(key);

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
                    {conditionDisplayKey}
                  </Text>
                  <InfoRow
                    label="Hiện tại"
                    value={`${condition.current}${translatedUnit}`}
                    icon="current-ac"
                    theme={theme}
                  />
                  <InfoRow
                    label="Tối ưu"
                    value={`${condition.optimal.min}${translatedUnit} - ${condition.optimal.max}${translatedUnit}`}
                    icon="target"
                    theme={theme}
                  />
                  <InfoRow
                    label="Trạng thái"
                    value={translatedCondStatus}
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
              const translatedSensorStatus = translateStatus(sensor.status);
              const statusStyle = getStatusStyle(sensor.status, theme);
              const translatedUnitDisplay = translateUnitIfNeeded(sensor.unit);
              let sensorIcon: keyof typeof MaterialCommunityIcons.glyphMap =
                "gauge-empty";

              const sensorDisplayName = translateSensorNameIfNeeded(
                sensor.name
              );

              // Icon selection based on translated or original name for broader matching
              const lowerSensorName = sensor.name.toLowerCase();
              if (
                lowerSensorName.includes("temp") ||
                lowerSensorName.includes("nhiệt")
              )
                sensorIcon = "thermometer";
              if (
                lowerSensorName.includes("ẩm") ||
                lowerSensorName.includes("moisture") ||
                lowerSensorName.includes("humid")
              )
                sensorIcon = "water-percent";
              if (lowerSensorName.includes("ph"))
                sensorIcon = "alpha-p-box-outline";
              if (
                lowerSensorName.includes("sáng") ||
                lowerSensorName.includes("light")
              )
                sensorIcon = "brightness-5";

              return (
                <InfoRow
                  key={sensor.id}
                  label={sensorDisplayName}
                  value={`${sensor.currentValue} ${translatedUnitDisplay} (${translatedSensorStatus})`}
                  icon={sensorIcon}
                  iconColor={statusStyle.color}
                  theme={theme}
                  valueStyle={{
                    color: statusStyle.color,
                    fontFamily: "Inter-Regular",
                  }}
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
            value={`${plantStats.currentConditions.weather.current.temp}${translateUnitIfNeeded("Celsius")}`}
            icon="thermometer"
            theme={theme}
          />
          <InfoRow
            label="Độ ẩm"
            value={`${plantStats.currentConditions.weather.current.humidity}${translateUnitIfNeeded("percent")}`}
            icon="water-percent"
            theme={theme}
          />
          <InfoRow
            label="Mô tả"
            value={plantStats.currentConditions.weather.current.weatherDesc} // This should be localized if possible
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
            value={plantStats.predictions.expectedYield} // This might need translation
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
              .slice(0, 3)
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
                  key={action.id} // Use action.id if available and unique
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
            const translatedOverallStatus = translateStatus(
              plantDetailedAdvice.overallAssessment.status
            );
            const statusStyle = getStatusStyle(
              plantDetailedAdvice.overallAssessment.status,
              theme
            );
            return (
              <>
                <InfoRow
                  label="Điểm sức khỏe"
                  value={`${plantDetailedAdvice.overallAssessment.healthScore}/100`}
                  icon="star-circle-outline"
                  theme={theme}
                />
                <InfoRow
                  label="Trạng thái"
                  value={translatedOverallStatus}
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
            .slice(0, 2)
            .map((tip: string, i: number) => (
              <View key={`watering-tip-${i}`} style={styles.tipItem}>
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
            .slice(0, 2)
            .map((tip: string, i: number) => (
              <View key={`fertilizing-tip-${i}`} style={styles.tipItem}>
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
            const translatedRiskLevel = translateStatus(riskLevel);
            const statusStyle = getStatusStyle(riskLevel, theme);
            return (
              <InfoRow
                label="Mức độ rủi ro"
                value={translatedRiskLevel}
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
              styles.infoTextSmallLabel,
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
            .slice(0, 2)
            .map((p: string, i: number) => (
              <View key={`prevention-tip-${i}`} style={styles.tipItem}>
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
                    styles.infoTextSmallLabel,
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
                  .slice(0, 2)
                  .map((t: string, i: number) => (
                    <View key={`treatment-tip-${i}`} style={styles.tipItem}>
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
              const translatedEnvStatus = translateStatus(advice.status);
              const statusStyle = getStatusStyle(advice.status, theme);
              let adviceIconName: keyof typeof MaterialCommunityIcons.glyphMap =
                "help-circle-outline";
              const adviceDisplayKey = translateConditionKey(key);

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
                      {adviceDisplayKey}
                    </Text>
                  </View>
                  <InfoRow
                    label="Trạng thái"
                    value={translatedEnvStatus}
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
                  {advice.optimal && !advice.optimalRange && (
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
                            ? theme.background // Or a slightly different shade if available like theme.subtleBackground
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingVertical: 16,
    paddingHorizontal: 12,
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
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E0E0E0", // Using a light grey border for cards, replace with theme.borderLight if available
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionHeaderIcon: {
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Inter-Bold",
    flexShrink: 1,
  },
  subSectionTitle: {
    fontSize: 17,
    fontFamily: "Inter-SemiBold",
    marginBottom: 10,
    marginTop: 10,
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
    marginTop: 3,
  },
  infoRowLabel: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    marginRight: 8,
    minWidth: 110, // Increased minWidth for Vietnamese labels
    // color: "#666666", // Removed to use theme.textSecondary
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
    marginBottom: 6,
    marginTop: 12,
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
    marginBottom: 8,
  },
  listItemIcon: {
    marginRight: 10,
  },
  listItemTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    flexShrink: 1,
  },
  listItemDescription: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    marginBottom: 8,
    lineHeight: 20,
    marginLeft: 30,
  },
  infoTextSmallLabel: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    lineHeight: 18,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
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
    marginVertical: 4,
    marginLeft: 8,
  },
  tipIcon: {
    marginRight: 8,
    marginTop: 3,
  },
  tipText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    lineHeight: 20,
    flexShrink: 1,
  },
  conditionDetailItem: {
    paddingTop: 12,
    marginTop: 12,
    paddingBottom: 8,
    paddingLeft: 12,
    borderLeftWidth: 4,
    borderRadius: 8,
    borderTopWidth: 1,
    // borderColor already set inline by status or theme.borderLight
  },
  conditionTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    marginBottom: 10,
  },
  envAdviceItem: {
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderLeftWidth: 4,
    borderRadius: 8,
  },
  envAdviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  envAdviceIcon: {
    marginRight: 10,
  },
  envAdviceTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    flexShrink: 1,
  },
  adviceTextContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
    padding: 10,
    borderRadius: 6,
  },
  adviceIcon: {
    marginRight: 8,
    marginTop: 3,
  },
  noDataText: {
    fontSize: 14,
    fontFamily: "Inter-Italic",
    marginVertical: 10,
    textAlign: "center",
  },
});

export default GardenPlantTab;
