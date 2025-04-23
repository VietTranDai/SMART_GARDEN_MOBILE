import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";

// Mock garden data
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

export default function GardensScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [gardens, setGardens] = useState(GARDENS);
  const [showEmpty, setShowEmpty] = useState(false);
  const theme = useAppTheme();

  const styles = useMemo(() => createStyles(theme), [theme]);

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

  const renderGardenItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        style={[styles.gardenCard, { backgroundColor: theme.card }]}
        onPress={() => router.push(`/gardens/${item.id}`)}
      >
        <Image source={{ uri: item.image }} style={styles.gardenImage} />
        <View style={styles.gardenInfo}>
          <Text style={[styles.gardenName, { color: theme.text }]}>
            {item.name}
          </Text>
          <View style={styles.gardenMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="leaf" size={14} color={theme.primary} />
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="flower" size={14} color={theme.primary} />
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                {item.plantCount} Plants
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: theme.card }]}
          onPress={(e) => {
            e.stopPropagation();
            router.push(`/gardens/edit/${item.id}`);
          }}
        >
          <Ionicons name="pencil" size={18} color={theme.primary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "My Gardens",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push("/gardens/create")}
              style={styles.addButton}
            >
              <Ionicons name="add" size={24} color={theme.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <View
        style={[
          styles.container,
          { backgroundColor: theme.backgroundSecondary },
        ]}
      >
        {gardens.length > 0 ? (
          <FlatList
            data={gardens}
            renderItem={renderGardenItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="leaf" size={64} color={theme.textTertiary} />
            <Text style={[styles.emptyText, { color: theme.text }]}>
              No gardens yet
            </Text>
            <Text style={[styles.emptySubText, { color: theme.textSecondary }]}>
              Create your first garden!
            </Text>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: theme.primary }]}
              onPress={() => router.push("/gardens/create")}
            >
              <Text style={styles.createButtonText}>Create Garden</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
}

const { width } = Dimensions.get("window");

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    listContainer: {
      padding: 16,
    },
    gardenCard: {
      borderRadius: 12,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      overflow: "hidden",
      position: "relative",
    },
    gardenImage: {
      width: "100%",
      height: 150,
      resizeMode: "cover",
    },
    gardenInfo: {
      padding: 16,
    },
    gardenName: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 8,
    },
    gardenMeta: {
      flexDirection: "row",
      marginBottom: 8,
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 16,
    },
    metaText: {
      marginLeft: 4,
      fontSize: 14,
    },
    statusBadge: {
      position: "absolute",
      top: 12,
      right: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 16,
    },
    statusText: {
      color: "white",
      fontSize: 12,
      fontWeight: "600",
    },
    editButton: {
      position: "absolute",
      bottom: 12,
      right: 12,
      borderRadius: 16,
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    addButton: {
      marginRight: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    emptyText: {
      fontSize: 20,
      fontWeight: "bold",
      marginTop: 20,
    },
    emptySubText: {
      fontSize: 16,
      marginTop: 8,
      marginBottom: 24,
    },
    createButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      backgroundColor: theme.primary,
    },
    createButtonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 16,
    },
  });
