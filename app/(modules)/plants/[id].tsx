import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native";
import { Stack, useRouter, useGlobalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { plantService } from "@/service/api";
import { Plant, GrowthStage } from "@/types/plants";

export default function PlantDetailScreen() {
  const { id } = useGlobalSearchParams();
  const router = useRouter();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [growthStages, setGrowthStages] = useState<GrowthStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "growth" | "care">(
    "info"
  );
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    fetchPlantData();
  }, [id]);

  const fetchPlantData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch plant details
      const plantData = await plantService.getPlantById(id.toString());
      setPlant(plantData);

      // Fetch growth stages if available
      try {
        const growthStagesData = await plantService.getGrowthStages(
          id.toString()
        );
        setGrowthStages(growthStagesData);
      } catch (stageError) {
        console.log("No growth stages available:", stageError);
        // Not setting error state here as this is optional data
      }
    } catch (err) {
      console.error("Failed to fetch plant details:", err);
      setError("Failed to load plant details. Please try again later.");
      Alert.alert(
        "Error",
        "Failed to load plant details. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "#4CAF50";
      case "needs_water":
        return "#2196F3";
      case "needs_attention":
        return "#FF9800";
      default:
        return "#4CAF50";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "healthy":
        return "Healthy";
      case "needs_water":
        return "Needs Water";
      case "needs_attention":
        return "Needs Attention";
      default:
        return "Healthy";
    }
  };

  const getGrowthStageText = (stage: string) => {
    switch (stage) {
      case "seedling":
        return "Seedling";
      case "vegetative":
        return "Vegetative Growth";
      case "flowering":
        return "Flowering";
      case "fruiting":
        return "Fruiting";
      case "mature":
        return "Mature";
      default:
        return stage;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleAction = (action: string) => {
    // Here you would implement the API calls for each action
    Alert.alert(
      "Action",
      `${
        action.charAt(0).toUpperCase() + action.slice(1)
      } action will be performed.`,
      [{ text: "OK" }]
    );
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "water":
        return "water";
      case "prune":
        return "cut";
      case "fertilize":
        return "nutrition";
      case "harvest":
        return "basket";
      case "treat_pests":
        return "bug";
      default:
        return "help-circle";
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading plant details...
        </Text>
      </View>
    );
  }

  if (error || !plant) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle" size={48} color={theme.error} />
        <Text style={[styles.errorText, { color: theme.error }]}>
          {error || "Plant not found"}
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: theme.primary }]}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: plant.name,
        }}
      />
      <ScrollView style={styles.container}>
        {/* Plant Image & Quick Status */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                plant.imageUrl ||
                "https://via.placeholder.com/400x300?text=No+Image",
            }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.quickInfo}>
            <Text style={styles.scientificName}>
              {plant.scientificName || ""}
            </Text>
            <View style={styles.typeContainer}>
              <Text style={styles.typeLabel}>Type:</Text>
              <Text style={styles.typeValue}>
                {plant.plantType?.name || "Unknown"}
              </Text>
            </View>
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Family:</Text>
              <Text style={styles.statusValue}>
                {plant.family || "Unknown"}
              </Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "info" && styles.activeTab]}
            onPress={() => setActiveTab("info")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "info" && styles.activeTabText,
              ]}
            >
              Info
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "growth" && styles.activeTab]}
            onPress={() => setActiveTab("growth")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "growth" && styles.activeTabText,
              ]}
            >
              Growth Stages
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "care" && styles.activeTab]}
            onPress={() => setActiveTab("care")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "care" && styles.activeTabText,
              ]}
            >
              Care
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === "info" && (
            <>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>
                  {plant.description || "No description available."}
                </Text>
              </View>

              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Details</Text>
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Ionicons
                      name="leaf-outline"
                      size={24}
                      color={theme.primary}
                    />
                    <Text style={styles.detailLabel}>Plant Type</Text>
                    <Text style={styles.detailValue}>
                      {plant.plantType?.name || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons
                      name="calendar-outline"
                      size={24}
                      color={theme.primary}
                    />
                    <Text style={styles.detailLabel}>Created</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(plant.createdAt || "")}
                    </Text>
                  </View>
                  {plant.growthDuration && (
                    <View style={styles.detailItem}>
                      <Ionicons
                        name="time-outline"
                        size={24}
                        color={theme.primary}
                      />
                      <Text style={styles.detailLabel}>Growth Period</Text>
                      <Text style={styles.detailValue}>
                        {plant.growthDuration} days
                      </Text>
                    </View>
                  )}
                  <View style={styles.detailItem}>
                    <Ionicons
                      name="information-circle-outline"
                      size={24}
                      color={theme.primary}
                    />
                    <Text style={styles.detailLabel}>Family</Text>
                    <Text style={styles.detailValue}>
                      {plant.family || "Unknown"}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {activeTab === "growth" && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Growth Stages</Text>
              {growthStages.length > 0 ? (
                growthStages.map((stage, index) => (
                  <View key={stage.id} style={styles.growthStageItem}>
                    <View style={styles.growthStageHeader}>
                      <View style={styles.stageNumberContainer}>
                        <Text style={styles.stageNumber}>{index + 1}</Text>
                      </View>
                      <Text style={styles.growthStageName}>
                        {stage.stageName}
                      </Text>
                      <Text style={styles.growthStageDuration}>
                        {stage.duration} days
                      </Text>
                    </View>
                    <Text style={styles.growthStageDescription}>
                      {stage.description || "No description available."}
                    </Text>
                    <View style={styles.optimalConditions}>
                      <Text style={styles.optimalConditionsTitle}>
                        Optimal Conditions:
                      </Text>
                      <View style={styles.conditionItem}>
                        <Text style={styles.conditionLabel}>Temperature:</Text>
                        <Text style={styles.conditionValue}>
                          {stage.optimalTemperatureMin}°C -{" "}
                          {stage.optimalTemperatureMax}°C
                        </Text>
                      </View>
                      <View style={styles.conditionItem}>
                        <Text style={styles.conditionLabel}>Humidity:</Text>
                        <Text style={styles.conditionValue}>
                          {stage.optimalHumidityMin}% -{" "}
                          {stage.optimalHumidityMax}%
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>
                  No growth stage information available.
                </Text>
              )}
            </View>
          )}

          {activeTab === "care" && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Care Information</Text>
              {growthStages.length > 0 ? (
                <View>
                  {growthStages.map((stage) => (
                    <View key={`care-${stage.id}`} style={styles.careInfoItem}>
                      <Text style={styles.careStageTitle}>
                        {stage.stageName}
                      </Text>
                      <View style={styles.careDetail}>
                        <Text style={styles.careLabel}>Light:</Text>
                        <Text style={styles.careValue}>
                          {stage.lightRequirement || "No information"}
                        </Text>
                      </View>
                      <View style={styles.careDetail}>
                        <Text style={styles.careLabel}>Water:</Text>
                        <Text style={styles.careValue}>
                          {stage.waterRequirement || "No information"}
                        </Text>
                      </View>
                      <View style={styles.careDetail}>
                        <Text style={styles.careLabel}>Nutrients:</Text>
                        <Text style={styles.careValue}>
                          {stage.nutrientRequirement || "No information"}
                        </Text>
                      </View>
                      {stage.careInstructions && (
                        <View style={styles.careInstructions}>
                          <Text style={styles.careInstructionsTitle}>
                            Special Instructions:
                          </Text>
                          <Text style={styles.careInstructionsText}>
                            {stage.careInstructions}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noDataText}>
                  No care information available.
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const { width } = Dimensions.get("window");

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F5F7FA",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F5F7FA",
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: "#666",
    },
    editButton: {
      marginRight: 16,
    },
    image: {
      width: "100%",
      height: 250,
      resizeMode: "cover",
    },
    contentContainer: {
      padding: 16,
    },
    section: {
      backgroundColor: "white",
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    titleContainer: {
      flex: 1,
      marginRight: 16,
    },
    name: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#333",
    },
    scientificName: {
      fontSize: 16,
      fontStyle: "italic",
      color: "#666",
      marginTop: 4,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    statusText: {
      color: "white",
      fontSize: 14,
      fontWeight: "600",
    },
    description: {
      fontSize: 16,
      color: "#333",
      marginBottom: 16,
      lineHeight: 22,
    },
    infoGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -8,
    },
    infoItem: {
      width: "50%",
      padding: 8,
    },
    infoLabel: {
      fontSize: 12,
      color: "#666",
      marginTop: 4,
    },
    infoValue: {
      fontSize: 15,
      fontWeight: "600",
      color: "#333",
      marginTop: 2,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#333",
      marginBottom: 16,
    },
    metricsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    metricCard: {
      backgroundColor: "#F5F7FA",
      borderRadius: 8,
      padding: 16,
      alignItems: "center",
      width: "31%",
    },
    metricValue: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#333",
      marginVertical: 8,
    },
    metricLabel: {
      fontSize: 12,
      color: "#666",
      textAlign: "center",
    },
    historyContainer: {
      borderLeftWidth: 2,
      borderLeftColor: theme.primary,
      paddingLeft: 16,
      marginLeft: 8,
    },
    historyItem: {
      marginBottom: 24,
      position: "relative",
    },
    historyDateContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    historyDate: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#333",
    },
    heightContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    heightValue: {
      marginRight: 8,
      fontSize: 14,
      color: "#666",
    },
    heightBar: {
      width: 6,
      backgroundColor: theme.primary,
      borderRadius: 3,
      height: "50%",
      maxHeight: 40,
      minHeight: 10,
    },
    historyNotes: {
      fontSize: 14,
      color: "#666",
      lineHeight: 20,
    },
    actionsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -4,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "white",
      borderWidth: 1,
      borderColor: theme.primary,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
      margin: 4,
      flex: 1,
      minWidth: "45%",
      justifyContent: "center",
    },
    actionButtonActive: {
      backgroundColor: theme.primary,
    },
    actionButtonText: {
      marginLeft: 8,
      color: theme.primary,
      fontWeight: "500",
    },
    actionButtonTextActive: {
      color: "white",
    },
    imageContainer: {
      position: "relative",
    },
    quickInfo: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
    },
    typeContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    typeLabel: {
      fontSize: 12,
      fontWeight: "bold",
      color: "#fff",
      marginRight: 8,
    },
    typeValue: {
      fontSize: 14,
      color: "#fff",
    },
    statusContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    statusLabel: {
      fontSize: 12,
      fontWeight: "bold",
      color: "#fff",
      marginRight: 8,
    },
    statusValue: {
      fontSize: 14,
      color: "#fff",
    },
    tabsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 16,
    },
    tab: {
      padding: 12,
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
    },
    activeTab: {
      borderBottomColor: theme.primary,
    },
    tabText: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#666",
    },
    activeTabText: {
      color: theme.primary,
    },
    tabContent: {
      padding: 16,
    },
    sectionContainer: {
      marginBottom: 24,
    },
    detailsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -8,
    },
    detailItem: {
      width: "50%",
      padding: 8,
    },
    detailLabel: {
      fontSize: 12,
      color: "#666",
      marginTop: 4,
    },
    detailValue: {
      fontSize: 15,
      fontWeight: "600",
      color: "#333",
      marginTop: 2,
    },
    growthStageItem: {
      marginBottom: 24,
      position: "relative",
    },
    growthStageHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    stageNumberContainer: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 8,
    },
    stageNumber: {
      fontSize: 12,
      fontWeight: "bold",
      color: "#fff",
    },
    growthStageName: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#333",
    },
    growthStageDuration: {
      fontSize: 14,
      color: "#666",
    },
    growthStageDescription: {
      fontSize: 14,
      color: "#666",
      marginBottom: 8,
    },
    optimalConditions: {
      marginBottom: 12,
    },
    optimalConditionsTitle: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#333",
      marginBottom: 4,
    },
    conditionItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    conditionLabel: {
      fontSize: 12,
      color: "#666",
      width: 100,
    },
    conditionValue: {
      fontSize: 14,
      fontWeight: "600",
      color: "#333",
    },
    noDataText: {
      fontSize: 16,
      color: "#666",
      textAlign: "center",
      marginTop: 16,
    },
    careInfoItem: {
      marginBottom: 24,
    },
    careStageTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#333",
      marginBottom: 8,
    },
    careDetail: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    careLabel: {
      fontSize: 12,
      color: "#666",
      marginRight: 8,
      width: 80,
    },
    careValue: {
      fontSize: 14,
      fontWeight: "600",
      color: "#333",
    },
    careInstructions: {
      marginTop: 8,
    },
    careInstructionsTitle: {
      fontSize: 12,
      fontWeight: "bold",
      color: "#333",
      marginBottom: 4,
    },
    careInstructionsText: {
      fontSize: 14,
      color: "#666",
    },
    centerContent: {
      justifyContent: "center",
      alignItems: "center",
    },
    backButton: {
      padding: 16,
      borderRadius: 8,
      backgroundColor: theme.primary,
      marginTop: 16,
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#fff",
    },
    errorText: {
      fontSize: 18,
      fontWeight: "600",
      marginTop: 16,
      marginBottom: 16,
      textAlign: "center",
    },
  });
