import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { plantService } from "@/service/api";
import { Plant } from "@/types/plants";

export default function PlantsScreen() {
  const router = useRouter();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<Plant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    fetchPlants();
  }, []);

  useEffect(() => {
    filterPlants();
  }, [searchQuery, selectedFilter, plants]);

  const fetchPlants = async () => {
    try {
      setLoading(true);
      setError(null);
      const plantsData = await plantService.getPlants();
      setPlants(plantsData);
    } catch (err) {
      console.error("Failed to fetch plants:", err);
      setError("Failed to load plants. Please try again later.");
      Alert.alert("Error", "Failed to load plants. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filterPlants = () => {
    setLoading(true);

    let filtered = [...plants];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (plant) =>
          plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (plant.scientificName || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (plant.description || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type (all or specific type)
    if (selectedFilter !== "all") {
      filtered = filtered.filter((plant) => {
        const type = plant.plantType?.name.toLowerCase() || "";
        return type === selectedFilter;
      });
    }

    setFilteredPlants(filtered);
    setLoading(false);
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderPlantItem = ({ item }: { item: Plant }) => {
    return (
      <TouchableOpacity
        style={styles.plantCard}
        onPress={() => router.push(`/(modules)/plants/${item.id}`)}
      >
        <Image
          source={{
            uri:
              item.imageUrl ||
              "https://via.placeholder.com/400x300?text=No+Image",
          }}
          style={styles.plantImage}
        />
        <View style={styles.plantInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.plantName}>{item.name}</Text>
            <Text style={styles.scientificName}>
              {item.scientificName || ""}
            </Text>
          </View>

          <View style={styles.gardenInfo}>
            <Ionicons name="leaf" size={14} color={theme.primary} />
            <Text style={styles.gardenName}>
              {item.plantType?.name || "Unknown Type"}
            </Text>
          </View>

          <View style={styles.plantMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar" size={14} color={theme.primary} />
              <Text style={styles.metaText}>
                Created: {formatDate(item.createdAt || "")}
              </Text>
            </View>
            {item.growthDuration && (
              <View style={styles.metaItem}>
                <Ionicons name="time" size={14} color={theme.primary} />
                <Text style={styles.metaText}>
                  {item.growthDuration} days growth
                </Text>
              </View>
            )}
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: item.plantType
                  ? theme.primary
                  : theme.textTertiary,
              },
            ]}
          >
            <Text style={styles.statusText}>
              {item.plantType?.name || "No Type"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterButton = (filter: string, label: string, icon: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Ionicons
        name={icon as any}
        size={16}
        color={selectedFilter === filter ? "white" : theme.primary}
      />
      <Text
        style={[
          styles.filterButtonText,
          {
            color: selectedFilter === filter ? "white" : theme.primary,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "My Plants",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push("/(modules)/plants/create")}
              style={styles.addButton}
            >
              <Ionicons name="add" size={24} color={theme.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search"
              size={20}
              color={theme.textTertiary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search plants..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearButton}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={theme.textTertiary}
                />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.filtersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScrollContent}
          >
            {renderFilterButton("all", "All Plants", "leaf")}
            {renderFilterButton("vegetable", "Vegetables", "nutrition")}
            {renderFilterButton("fruit", "Fruits", "basket")}
            {renderFilterButton("herb", "Herbs", "flower")}
            {renderFilterButton("flower", "Flowers", "rose")}
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : filteredPlants.length > 0 ? (
          <FlatList
            data={filteredPlants}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderPlantItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="leaf-outline"
              size={64}
              color={theme.textTertiary}
            />
            <Text style={styles.emptyText}>No plants found</Text>
            <Text style={styles.emptySubText}>
              Try adjusting your filters or add a new plant
            </Text>
            <TouchableOpacity
              style={styles.addPlantButton}
              onPress={() => router.push("/(modules)/plants/create")}
            >
              <Text style={styles.addPlantButtonText}>Add New Plant</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F5F7FA",
    },
    searchContainer: {
      padding: 16,
      paddingBottom: 8,
    },
    searchInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "white",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#E0E0E0",
      paddingHorizontal: 12,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 10,
      fontSize: 16,
    },
    clearButton: {
      padding: 6,
    },
    filtersContainer: {
      paddingHorizontal: 8,
      marginBottom: 8,
    },
    filtersScrollContent: {
      paddingHorizontal: 8,
    },
    filterButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "white",
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginRight: 8,
      borderWidth: 1,
      borderColor: theme.primary,
    },
    filterButtonActive: {
      backgroundColor: theme.primary,
    },
    filterButtonText: {
      marginLeft: 4,
      color: theme.primary,
      fontWeight: "500",
    },
    listContainer: {
      padding: 16,
      paddingTop: 8,
    },
    plantCard: {
      backgroundColor: "white",
      borderRadius: 12,
      marginBottom: 16,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    plantImage: {
      width: "100%",
      height: 150,
      resizeMode: "cover",
    },
    plantInfo: {
      padding: 16,
    },
    nameContainer: {
      marginBottom: 6,
    },
    plantName: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#333",
    },
    scientificName: {
      fontSize: 14,
      fontStyle: "italic",
      color: "#666",
      marginTop: 2,
    },
    gardenInfo: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    gardenName: {
      marginLeft: 4,
      fontSize: 14,
      color: "#666",
    },
    plantMeta: {
      flexDirection: "row",
      marginTop: 6,
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 16,
    },
    metaText: {
      marginLeft: 4,
      fontSize: 13,
      color: "#666",
    },
    statusBadge: {
      position: "absolute",
      top: 16,
      right: 16,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 16,
    },
    statusText: {
      color: "white",
      fontSize: 12,
      fontWeight: "600",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
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
      color: "#333",
      marginTop: 20,
    },
    emptySubText: {
      fontSize: 16,
      color: "#666",
      marginTop: 8,
      textAlign: "center",
      marginBottom: 24,
    },
    addPlantButton: {
      backgroundColor: theme.primary,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    addPlantButtonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 16,
    },
    addButton: {
      marginRight: 16,
    },
  });
