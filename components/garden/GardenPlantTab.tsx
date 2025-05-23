import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { GardenPlantDetails } from "@/types";
import PlantDetailCard from "@/components/garden/PlantDetailCard";

interface GardenPlantTabProps {
  plantDetails?: GardenPlantDetails;
}

const GardenPlantTab: React.FC<GardenPlantTabProps> = ({ plantDetails }) => {
  const theme = useAppTheme();

  if (!plantDetails) {
    return (
      <View
        style={[
          styles.emptyPlantContainer,
          { backgroundColor: theme.background },
        ]}
      >
        <MaterialCommunityIcons
          name="sprout-outline"
          size={48}
          color={theme.textSecondary}
        />
        <Text style={[styles.emptyPlantText, { color: theme.text }]}>
          Chưa có thông tin cây trồng
        </Text>
        <Text
          style={[styles.emptyPlantSubtext, { color: theme.textSecondary }]}
        >
          Vườn này chưa có thông tin chi tiết về cây trồng
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <PlantDetailCard
        plantDetails={plantDetails}
        onViewFullDetails={() => {}}
      />

      <View style={styles.plantInfoContainer}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Thông tin chi tiết
        </Text>

        <View style={[styles.plantInfoCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.plantInfoTitle, { color: theme.text }]}>
            Mô tả
          </Text>
          <Text style={[styles.plantInfoText, { color: theme.text }]}>
            {plantDetails.description ||
              "Không có mô tả chi tiết cho loại cây này."}
          </Text>

          <View style={styles.plantMetaContainer}>
            <View style={styles.plantMetaItem}>
              <MaterialCommunityIcons
                name="calendar-range"
                size={18}
                color={theme.primary}
              />
              <View>
                <Text
                  style={[
                    styles.plantMetaLabel,
                    { color: theme.textSecondary },
                  ]}
                >
                  Thời gian phát triển
                </Text>
                <Text style={[styles.plantMetaValue, { color: theme.text }]}>
                  {plantDetails.growthDuration
                    ? `${plantDetails.growthDuration} ngày`
                    : "Không xác định"}
                </Text>
              </View>
            </View>

            <View style={styles.plantMetaItem}>
              <MaterialCommunityIcons
                name="water-outline"
                size={18}
                color={theme.info}
              />
              <View>
                <Text
                  style={[
                    styles.plantMetaLabel,
                    { color: theme.textSecondary },
                  ]}
                >
                  Nhu cầu nước
                </Text>
                <Text style={[styles.plantMetaValue, { color: theme.text }]}>
                  {plantDetails.waterRequirement || "Trung bình"}
                </Text>
              </View>
            </View>

            <View style={styles.plantMetaItem}>
              <MaterialCommunityIcons
                name="white-balance-sunny"
                size={18}
                color={theme.warning}
              />
              <View>
                <Text
                  style={[
                    styles.plantMetaLabel,
                    { color: theme.textSecondary },
                  ]}
                >
                  Nhu cầu ánh sáng
                </Text>
                <Text style={[styles.plantMetaValue, { color: theme.text }]}>
                  {plantDetails.lightRequirement || "Trung bình"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  emptyPlantContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyPlantText: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    marginTop: 12,
  },
  emptyPlantSubtext: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    marginTop: 4,
    textAlign: "center",
  },
  plantInfoContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    marginBottom: 16,
  },
  plantInfoCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  plantInfoTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    marginBottom: 8,
  },
  plantInfoText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    lineHeight: 20,
    marginBottom: 16,
  },
  plantMetaContainer: {
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    paddingTop: 16,
  },
  plantMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  plantMetaLabel: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    marginLeft: 8,
  },
  plantMetaValue: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    marginLeft: 8,
  },
});

export default GardenPlantTab;
