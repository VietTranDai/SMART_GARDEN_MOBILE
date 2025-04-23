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
} from "react-native";
import { Stack, useRouter, useGlobalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";

// Mock plant data (same as in index.tsx)
const PLANTS = [
  {
    id: "1",
    name: "Tomato Plant",
    scientificName: "Solanum lycopersicum",
    gardenId: "1",
    gardenName: "Vegetable Garden",
    type: "vegetable",
    status: "healthy",
    plantedDate: "2023-03-15T10:00:00Z",
    image:
      "https://images.unsplash.com/photo-1592086326887-37c39ba91db9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    lastWatered: "2023-05-10T08:30:00Z",
    soilMoisture: 72,
    description:
      "Roma tomato variety. Currently flowering and beginning to fruit.",
    growthStage: "flowering",
    temperature: 25,
    lightLevel: 78,
    growthHistory: [
      {
        date: "2023-03-15",
        height: 5,
        notes: "Plant seedling transplanted to garden.",
      },
      {
        date: "2023-03-30",
        height: 15,
        notes: "Plant showing good growth, new leaves forming.",
      },
      { date: "2023-04-15", height: 30, notes: "First flower buds appearing." },
      {
        date: "2023-05-01",
        height: 50,
        notes: "Multiple flowers present, first fruits forming.",
      },
    ],
    actions: ["water", "prune", "fertilize", "harvest"],
  },
  {
    id: "2",
    name: "Basil",
    scientificName: "Ocimum basilicum",
    gardenId: "3",
    gardenName: "Herb Garden",
    type: "herb",
    status: "needs_water",
    plantedDate: "2023-04-02T14:30:00Z",
    image:
      "https://images.unsplash.com/photo-1587684693075-097431e2a347?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    lastWatered: "2023-05-08T16:45:00Z",
    soilMoisture: 35,
    description: "Sweet basil plant. Ready for harvesting leaves.",
    growthStage: "mature",
    temperature: 23,
    lightLevel: 65,
    growthHistory: [
      {
        date: "2023-04-02",
        height: 8,
        notes: "Seedling planted in herb garden.",
      },
      {
        date: "2023-04-15",
        height: 15,
        notes: "Growing well, first harvest of a few leaves.",
      },
      {
        date: "2023-04-28",
        height: 22,
        notes: "Regular harvesting of leaves for cooking.",
      },
    ],
    actions: ["water", "harvest", "fertilize"],
  },
  {
    id: "3",
    name: "Rose Bush",
    scientificName: "Rosa hybrid",
    gardenId: "2",
    gardenName: "Flower Bed",
    type: "flower",
    status: "needs_attention",
    plantedDate: "2023-02-10T11:15:00Z",
    image:
      "https://images.unsplash.com/photo-1589649571514-83ac26711179?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    lastWatered: "2023-05-01T10:15:00Z",
    soilMoisture: 30,
    description: "Red hybrid tea rose. Needs treatment for aphids.",
    growthStage: "flowering",
    temperature: 24,
    lightLevel: 90,
    growthHistory: [
      {
        date: "2023-02-10",
        height: 25,
        notes: "Planted rose bush from nursery.",
      },
      {
        date: "2023-03-01",
        height: 30,
        notes: "New growth visible, looking healthy.",
      },
      { date: "2023-04-15", height: 45, notes: "First buds appearing." },
      {
        date: "2023-05-01",
        height: 55,
        notes: "Several flowers blooming. Some aphids detected.",
      },
    ],
    actions: ["water", "prune", "treat_pests", "fertilize"],
  },
  {
    id: "4",
    name: "Cucumber",
    scientificName: "Cucumis sativus",
    gardenId: "1",
    gardenName: "Vegetable Garden",
    type: "vegetable",
    status: "healthy",
    plantedDate: "2023-03-20T09:45:00Z",
    image:
      "https://images.unsplash.com/photo-1582637512035-e33cfae405cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    lastWatered: "2023-05-10T08:30:00Z",
    soilMoisture: 68,
    description: "Pickling cucumber variety. Growing well with many flowers.",
    growthStage: "flowering",
    temperature: 26,
    lightLevel: 85,
    growthHistory: [
      {
        date: "2023-03-20",
        height: 6,
        notes: "Seedling transplanted to garden.",
      },
      {
        date: "2023-04-05",
        height: 20,
        notes: "Vine starting to spread, training on trellis.",
      },
      { date: "2023-04-25", height: 45, notes: "First flowers appearing." },
      {
        date: "2023-05-10",
        height: 75,
        notes: "Many flowers, first cucumbers forming.",
      },
    ],
    actions: ["water", "prune", "fertilize", "harvest"],
  },
  {
    id: "5",
    name: "Mint",
    scientificName: "Mentha spicata",
    gardenId: "3",
    gardenName: "Herb Garden",
    type: "herb",
    status: "healthy",
    plantedDate: "2023-04-05T13:20:00Z",
    image:
      "https://images.unsplash.com/photo-1628557044797-f21a177c37ec?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    lastWatered: "2023-05-08T16:45:00Z",
    soilMoisture: 62,
    description:
      "Spearmint plant. Growing vigorously and ready for harvesting.",
    growthStage: "mature",
    temperature: 22,
    lightLevel: 70,
    growthHistory: [
      { date: "2023-04-05", height: 10, notes: "Small mint cutting planted." },
      {
        date: "2023-04-15",
        height: 15,
        notes: "Starting to spread, new shoots appearing.",
      },
      {
        date: "2023-04-28",
        height: 20,
        notes: "Growing vigorously, contained in pot to prevent spreading.",
      },
    ],
    actions: ["water", "harvest", "prune", "fertilize"],
  },
  {
    id: "6",
    name: "Apple Tree",
    scientificName: "Malus domestica",
    gardenId: "4",
    gardenName: "Fruit Trees",
    type: "fruit",
    status: "healthy",
    plantedDate: "2022-10-12T15:00:00Z",
    image:
      "https://images.unsplash.com/photo-1569870499705-504209102861?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    lastWatered: "2023-05-05T09:00:00Z",
    soilMoisture: 58,
    description: "Honeycrisp apple variety. Currently flowering.",
    growthStage: "flowering",
    temperature: 24,
    lightLevel: 95,
    growthHistory: [
      { date: "2022-10-12", height: 100, notes: "Young apple tree planted." },
      {
        date: "2023-03-01",
        height: 115,
        notes: "New spring growth after winter dormancy.",
      },
      { date: "2023-04-15", height: 130, notes: "Flower buds developing." },
      { date: "2023-05-01", height: 135, notes: "Tree in full bloom." },
    ],
    actions: ["water", "prune", "fertilize", "treat_pests"],
  },
];

export default function PlantDetailScreen() {
  const router = useRouter();
  const { id } = useGlobalSearchParams();
  const [plant, setPlant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [performingAction, setPerformingAction] = useState<string | null>(null);
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    // Simulate loading from API
    setLoading(true);
    setTimeout(() => {
      const foundPlant = PLANTS.find((p) => p.id === id);
      if (foundPlant) {
        setPlant(foundPlant as any);
      } else {
        // Handle plant not found
        router.replace("/plants");
      }
      setLoading(false);
    }, 700);
  }, [id]);

  if (loading || !plant) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Loading plant information...</Text>
      </View>
    );
  }

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
        return stage.charAt(0).toUpperCase() + stage.slice(1);
    }
  };

  const formatDate = (dateString: string) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options as any);
  };

  const handleAction = (action: string) => {
    setPerformingAction(action);

    // Simulate API call
    setTimeout(() => {
      setPerformingAction(null);
      // In a real app, we would update the plant state here
    }, 1500);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "water":
        return "water";
      case "prune":
        return "cut";
      case "fertilize":
        return "leaf";
      case "harvest":
        return "basket";
      case "treat_pests":
        return "bug";
      default:
        return "leaf";
    }
  };

  const renderActionButton = (action: string) => {
    const isActive = performingAction === action;
    const icon = getActionIcon(action);
    const actionText =
      action.charAt(0).toUpperCase() + action.slice(1).replace("_", " ");

    return (
      <TouchableOpacity
        key={action}
        style={[styles.actionButton, isActive && styles.actionButtonActive]}
        onPress={() => handleAction(action)}
        disabled={!!performingAction}
      >
        <Ionicons
          name={icon}
          size={20}
          color={isActive ? "white" : theme.primary}
        />
        <Text
          style={[
            styles.actionButtonText,
            isActive && styles.actionButtonTextActive,
          ]}
        >
          {isActive ? `${actionText}...` : actionText}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: plant.name,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push(`/plants/edit/${plant.id}`)}
              style={styles.editButton}
            >
              <Ionicons name="pencil" size={20} color={theme.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container}>
        <Image source={{ uri: plant.image }} style={styles.image} />

        <View style={styles.contentContainer}>
          {/* Plant Info Section */}
          <View style={styles.section}>
            <View style={styles.headerRow}>
              <View style={styles.titleContainer}>
                <Text style={styles.name}>{plant.name}</Text>
                <Text style={styles.scientificName}>
                  {plant.scientificName}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(plant.status) },
                ]}
              >
                <Text style={styles.statusText}>
                  {getStatusText(plant.status)}
                </Text>
              </View>
            </View>

            <Text style={styles.description}>{plant.description}</Text>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Ionicons name="leaf" size={16} color={theme.primary} />
                <Text style={styles.infoLabel}>Garden</Text>
                <Text
                  style={styles.infoValue}
                  onPress={() => router.push(`/gardens/${plant.gardenId}`)}
                >
                  {plant.gardenName}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="calendar" size={16} color={theme.primary} />
                <Text style={styles.infoLabel}>Planted</Text>
                <Text style={styles.infoValue}>
                  {formatDate(plant.plantedDate)}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="water" size={16} color={theme.primary} />
                <Text style={styles.infoLabel}>Last Watered</Text>
                <Text style={styles.infoValue}>
                  {formatDate(plant.lastWatered)}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="fitness" size={16} color={theme.primary} />
                <Text style={styles.infoLabel}>Growth Stage</Text>
                <Text style={styles.infoValue}>
                  {getGrowthStageText(plant.growthStage)}
                </Text>
              </View>
            </View>
          </View>

          {/* Environmental Metrics Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Environmental Metrics</Text>
            <View style={styles.metricsContainer}>
              <View style={styles.metricCard}>
                <Ionicons name="water" size={24} color="#2196F3" />
                <Text style={styles.metricValue}>{plant.soilMoisture}%</Text>
                <Text style={styles.metricLabel}>Soil Moisture</Text>
              </View>
              <View style={styles.metricCard}>
                <Ionicons name="sunny" size={24} color="#FFC107" />
                <Text style={styles.metricValue}>{plant.lightLevel}%</Text>
                <Text style={styles.metricLabel}>Light Level</Text>
              </View>
              <View style={styles.metricCard}>
                <Ionicons name="thermometer" size={24} color="#F44336" />
                <Text style={styles.metricValue}>{plant.temperature}°C</Text>
                <Text style={styles.metricLabel}>Temperature</Text>
              </View>
            </View>
          </View>

          {/* Growth History Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Growth History</Text>
            <View style={styles.historyContainer}>
              {plant.growthHistory.map((record: any, index: number) => (
                <View key={index} style={styles.historyItem}>
                  <View style={styles.historyDateContainer}>
                    <Text style={styles.historyDate}>{record.date}</Text>
                    <View style={styles.heightContainer}>
                      <Text style={styles.heightValue}>{record.height} cm</Text>
                      <View
                        style={[
                          styles.heightBar,
                          {
                            height: `${Math.min(
                              100,
                              (record.height /
                                Math.max(
                                  ...plant.growthHistory.map((h: any) => h.height)
                                )) *
                                100
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <Text style={styles.historyNotes}>{record.notes}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Actions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Plant Actions</Text>
            <View style={styles.actionsContainer}>
              {plant.actions.map((action: string) => renderActionButton(action))}
            </View>
          </View>
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
});
