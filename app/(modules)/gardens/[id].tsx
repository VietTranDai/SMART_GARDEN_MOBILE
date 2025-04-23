import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import SensorReadings from "@/components/SensorReadings";

interface GardenData {
  id: string;
  name: string;
  description: string;
  status: "healthy" | "attention" | "critical";
  plantType: string;
  createdAt: string;
  lastWatered: string;
  sensorData: {
    temperature: number;
    humidity: number;
    soilMoisture: number;
    lightLevel: number;
  };
}

// Mock garden data - would be fetched from API in real app
const MOCK_GARDENS: Record<string, GardenData> = {
  "1": {
    id: "1",
    name: "Herb Garden",
    description: "Collection of culinary herbs",
    status: "healthy",
    plantType: "Herbs",
    createdAt: "2023-01-15",
    lastWatered: "2023-04-10T08:30:00Z",
    sensorData: {
      temperature: 23.5,
      humidity: 65,
      soilMoisture: 75,
      lightLevel: 80,
    },
  },
  "2": {
    id: "2",
    name: "Vegetable Patch",
    description: "Seasonal vegetables",
    status: "attention",
    plantType: "Vegetables",
    createdAt: "2023-02-20",
    lastWatered: "2023-04-09T10:15:00Z",
    sensorData: {
      temperature: 25.2,
      humidity: 55,
      soilMoisture: 45,
      lightLevel: 85,
    },
  },
  "3": {
    id: "3",
    name: "Flower Bed",
    description: "Ornamental flowers",
    status: "critical",
    plantType: "Flowers",
    createdAt: "2023-03-10",
    lastWatered: "2023-04-05T16:45:00Z",
    sensorData: {
      temperature: 27.0,
      humidity: 40,
      soilMoisture: 30,
      lightLevel: 90,
    },
  },
};

export default function GardenDetail() {
  const theme = useAppTheme();

  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [garden, setGarden] = useState<GardenData | null>(null);

  useEffect(() => {
    // Simulate fetching garden data
    // In a real app, this would be an API call
    if (id && typeof id === "string") {
      setGarden(MOCK_GARDENS[id]);
    }
  }, [id]);

  if (!garden) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading garden information...</Text>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return theme.success;
      case "attention":
        return theme.warning;
      case "critical":
        return theme.error;
      default:
        return theme.success;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {garden.name}
        </Text>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={{ uri: "https://picsum.photos/300/200" }}
          style={styles.image}
          resizeMode="cover"
        />
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(garden.status) },
          ]}
        >
          <Text style={styles.statusText}>{garden.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={[styles.description, { color: theme.text }]}>
          {garden.description}
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <FontAwesome5 name="seedling" size={20} color={theme.primary} />
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Plant Type
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {garden.plantType}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <FontAwesome5 name="calendar-alt" size={20} color={theme.primary} />
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Created
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {formatDate(garden.createdAt)}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <FontAwesome5 name="tint" size={20} color={theme.primary} />
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Last Watered
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {formatDate(garden.lastWatered)}
            </Text>
          </View>
        </View>

        <View style={styles.sensorSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Current Readings
          </Text>
          <SensorReadings data={garden.sensorData} />
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
          >
            <FontAwesome5 name="tint" size={20} color="white" />
            <Text style={styles.actionButtonText}>Water Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.secondaryButton,
              { borderColor: theme.primary },
            ]}
          >
            <FontAwesome5 name="history" size={20} color={theme.primary} />
            <Text
              style={[styles.secondaryButtonText, { color: theme.primary }]}
            >
              View History
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  imageContainer: {
    position: "relative",
    height: 220,
    width: "100%",
  },
  image: {
    height: "100%",
    width: "100%",
  },
  statusBadge: {
    position: "absolute",
    bottom: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  detailsContainer: {
    padding: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  infoItem: {
    alignItems: "center",
    flex: 1,
  },
  infoLabel: {
    marginTop: 6,
    marginBottom: 2,
  },
  infoValue: {
    fontWeight: "600",
  },
  sensorSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    marginLeft: 8,
    marginRight: 0,
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
  secondaryButtonText: {
    fontWeight: "bold",
    marginLeft: 8,
  },
});
