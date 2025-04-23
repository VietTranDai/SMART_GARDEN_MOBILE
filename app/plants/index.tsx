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
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";

// Mock plant data
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
  },
];

export default function PlantsScreen() {
  const router = useRouter();
  const [plants, setPlants] = useState(PLANTS);
  const [filteredPlants, setFilteredPlants] = useState(PLANTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    filterPlants();
  }, [searchQuery, selectedFilter]);

  const filterPlants = () => {
    setLoading(true);

    let filtered = [...plants];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (plant) =>
          plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          plant.scientificName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          plant.gardenName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (selectedFilter !== "all") {
      filtered = filtered.filter((plant) => plant.type === selectedFilter);
    }

    setFilteredPlants(filtered);

    // Simulate API loading
    setTimeout(() => {
      setLoading(false);
    }, 300);
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
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderPlantItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        style={styles.plantCard}
        onPress={() => router.push(`/plants/${item.id}`)}
      >
        <Image source={{ uri: item.image }} style={styles.plantImage} />
        <View style={styles.plantInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.plantName}>{item.name}</Text>
            <Text style={styles.scientificName}>{item.scientificName}</Text>
          </View>

          <View style={styles.gardenInfo}>
            <Ionicons name="leaf" size={14} color={theme.primary} />
            <Text style={styles.gardenName}>{item.gardenName}</Text>
          </View>

          <View style={styles.plantMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar" size={14} color={theme.primary} />
              <Text style={styles.metaText}>
                Planted: {formatDate(item.plantedDate)}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="water" size={14} color={theme.primary} />
              <Text style={styles.metaText}>{item.soilMoisture}% Moisture</Text>
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
          selectedFilter === filter && styles.filterButtonTextActive,
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
              onPress={() => router.push("/plants/create")}
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
            renderItem={renderPlantItem}
            keyExtractor={(item) => item.id}
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
              onPress={() => router.push("/plants/create")}
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
    filterButtonTextActive: {
      color: "white",
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
