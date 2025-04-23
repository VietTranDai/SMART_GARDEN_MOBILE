import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Stack, useRouter, useGlobalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";

// Mock garden data (same as in index.tsx)
const GARDENS = [
  {
    id: "1",
    name: "Vegetable Garden",
    type: "vegetable",
    status: "healthy",
    plantCount: 12,
    image:
      "https://images.unsplash.com/photo-1593498212053-2001a3631307?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    lastWatered: "2023-05-10T08:30:00Z",
    description:
      "My first vegetable garden with tomatoes, cucumbers, and peppers.",
    soilMoisture: 68,
    lightLevel: 85,
    temperature: 24,
  },
  {
    id: "2",
    name: "Flower Bed",
    type: "flower",
    status: "needs_water",
    plantCount: 8,
    image:
      "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    lastWatered: "2023-05-01T10:15:00Z",
    description: "Beautiful flower bed with roses, tulips and daffodils.",
    soilMoisture: 30,
    lightLevel: 90,
    temperature: 26,
  },
  {
    id: "3",
    name: "Herb Garden",
    type: "herb",
    status: "healthy",
    plantCount: 6,
    image:
      "https://images.unsplash.com/photo-1599047850212-0d99725b5c96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    lastWatered: "2023-05-08T16:45:00Z",
    description: "Indoor herb garden with basil, thyme, mint, and rosemary.",
    soilMoisture: 72,
    lightLevel: 65,
    temperature: 22,
  },
  {
    id: "4",
    name: "Fruit Trees",
    type: "fruit",
    status: "needs_attention",
    plantCount: 4,
    image:
      "https://images.unsplash.com/photo-1592453106033-d8a035da886b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    lastWatered: "2023-05-05T09:00:00Z",
    description: "Small orchard with apple and pear trees.",
    soilMoisture: 55,
    lightLevel: 95,
    temperature: 28,
  },
];

export default function GardenDetailScreen() {
  const router = useRouter();
  const { id } = useGlobalSearchParams();
  const [garden, setGarden] = useState<any>(null);
  const [isWatering, setIsWatering] = useState(false);
  const theme = useAppTheme();

  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    // Find the garden with the matching ID
    const foundGarden = GARDENS.find((g) => g.id === id);
    if (foundGarden) {
      setGarden(foundGarden as any);
    } else {
      // Handle case where garden is not found
      router.replace("/gardens");
    }
  }, [id]);

  if (!garden) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <Text style={{ color: theme.text }}>Loading...</Text>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return theme.success;
      case "needs_water":
        return theme.info;
      case "needs_attention":
        return theme.warning;
      default:
        return theme.success;
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

  const handleWaterGarden = () => {
    setIsWatering(true);
    // Simulate watering process
    setTimeout(() => {
      setIsWatering(false);
      // Update garden status if needed (in a real app)
    }, 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: garden.name,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push(`/gardens/edit/${garden.id}`)}
              style={styles.editButton}
            >
              <Ionicons name="pencil" size={20} color={theme.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        style={[
          styles.container,
          { backgroundColor: theme.backgroundSecondary },
        ]}
      >
        <Image source={{ uri: garden.image }} style={styles.image} />

        <View
          style={[
            styles.contentContainer,
            { backgroundColor: theme.background },
          ]}
        >
          {/* Garden Info */}
          <View style={styles.section}>
            <View style={styles.headerRow}>
              <View>
                <Text style={[styles.name, { color: theme.text }]}>
                  {garden.name}
                </Text>
                <View style={styles.typeContainer}>
                  <Ionicons name="leaf" size={16} color={theme.primary} />
                  <Text style={[styles.type, { color: theme.textSecondary }]}>
                    {garden.type.charAt(0).toUpperCase() + garden.type.slice(1)}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(garden.status) },
                ]}
              >
                <Text style={styles.statusText}>
                  {getStatusText(garden.status)}
                </Text>
              </View>
            </View>
            <Text style={[styles.description, { color: theme.textSecondary }]}>
              {garden.description}
            </Text>
            <Text style={[styles.plantCount, { color: theme.textSecondary }]}>
              {garden.plantCount} Plants
            </Text>
            <Text style={[styles.lastWatered, { color: theme.textSecondary }]}>
              Last Watered: {formatDate(garden.lastWatered)}
            </Text>
          </View>

          {/* Metrics Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Garden Metrics
            </Text>
            <View style={styles.metricsContainer}>
              <View
                style={[styles.metricCard, { backgroundColor: theme.card }]}
              >
                <Ionicons name="water" size={24} color={theme.info} />
                <Text style={[styles.metricValue, { color: theme.text }]}>
                  {garden.soilMoisture}%
                </Text>
                <Text
                  style={[styles.metricLabel, { color: theme.textSecondary }]}
                >
                  Soil Moisture
                </Text>
              </View>

              <View
                style={[styles.metricCard, { backgroundColor: theme.card }]}
              >
                <Ionicons name="sunny" size={24} color={theme.warning} />
                <Text style={[styles.metricValue, { color: theme.text }]}>
                  {garden.lightLevel}%
                </Text>
                <Text
                  style={[styles.metricLabel, { color: theme.textSecondary }]}
                >
                  Light
                </Text>
              </View>

              <View
                style={[styles.metricCard, { backgroundColor: theme.card }]}
              >
                <Ionicons name="thermometer" size={24} color={theme.error} />
                <Text style={[styles.metricValue, { color: theme.text }]}>
                  {garden.temperature}°C
                </Text>
                <Text
                  style={[styles.metricLabel, { color: theme.textSecondary }]}
                >
                  Temperature
                </Text>
              </View>
            </View>
          </View>

          {/* Actions Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Actions
            </Text>
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.primary },
                  isWatering && { opacity: 0.7 },
                ]}
                onPress={handleWaterGarden}
                disabled={isWatering}
              >
                <Ionicons name="water" size={20} color="white" />
                <Text style={styles.actionButtonText}>
                  {isWatering ? "Watering..." : "Water Now"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.info }]}
              >
                <Ionicons name="refresh" size={20} color="white" />
                <Text style={styles.actionButtonText}>Update Sensors</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Plants Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Plants
              </Text>
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => router.push(`/gardens/${garden.id}/plants`)}
              >
                <Text style={{ color: theme.primary }}>View All</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.primary}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.addPlantButton, { borderColor: theme.border }]}
              onPress={() => router.push(`/gardens/${garden.id}/add-plant`)}
            >
              <Ionicons name="add-circle" size={24} color={theme.primary} />
              <Text style={{ color: theme.primary }}>Add New Plant</Text>
            </TouchableOpacity>
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
    name: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#333",
      marginBottom: 4,
    },
    typeContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    type: {
      fontSize: 16,
      color: "#666",
      marginLeft: 4,
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
      marginBottom: 12,
      lineHeight: 22,
    },
    plantCount: {
      fontSize: 14,
      color: "#666",
      marginBottom: 4,
    },
    lastWatered: {
      fontSize: 14,
      color: "#666",
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
    actionsContainer: {
      gap: 12,
    },
    actionButton: {
      backgroundColor: theme.primary,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    actionButtonDisabled: {
      backgroundColor: "#A0A0A0",
    },
    actionButtonText: {
      color: "white",
      fontWeight: "600",
      marginLeft: 8,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    viewAllButton: {
      flexDirection: "row",
      alignItems: "center",
    },
    addPlantButton: {
      borderWidth: 2,
      borderColor: "#666",
      borderStyle: "dashed",
      borderRadius: 8,
      padding: 12,
      alignItems: "center",
      justifyContent: "center",
    },
  });
