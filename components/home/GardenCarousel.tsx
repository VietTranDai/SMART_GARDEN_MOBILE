import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Garden, GardenType } from "@/types/gardens/garden.types";
import env from "@/config/environment";

interface GardenCarouselProps {
  gardens: Garden[];
  onGardenPress: (garden: Garden) => void;
  onPinPress: (garden: Garden) => void;
}

const GARDEN_TYPE_ICONS: Record<GardenType, string> = {
  [GardenType.INDOOR]: "home",
  [GardenType.OUTDOOR]: "tree",
  [GardenType.BALCONY]: "view-dashboard",
  [GardenType.ROOFTOP]: "roofing",
  [GardenType.WINDOW_SILL]: "window-maximize",
};

export default function GardenCarousel({
  gardens,
  onGardenPress,
  onPinPress,
}: GardenCarouselProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {gardens.map((garden) => (
          <TouchableOpacity
            key={garden.id}
            style={styles.gardenCard}
            onPress={() => onGardenPress(garden)}
          >
            <Image  
              source={
                garden.profilePicture
                  ? { uri: `${env.apiUrl}${garden.profilePicture}` }
                  : require("@/assets/images/default-garden.png")
              }
              style={styles.gardenImage}
            />
            <View style={styles.gardenInfo}>
              <Text style={styles.gardenName} numberOfLines={1}>
                {garden.name}
              </Text>
              <View style={styles.gardenTypeContainer}>
                <MaterialCommunityIcons
                  name={GARDEN_TYPE_ICONS[garden.type] as any}
                  size={16}
                  color={theme.textSecondary}
                />
                <Text style={styles.gardenType}>
                  {garden.type.toLowerCase()}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.pinButton}
              onPress={() => onPinPress(garden)}
            >
              <MaterialCommunityIcons
                name="pin"
                size={20}
                color={theme.primary}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginVertical: 16,
    },
    scrollContent: {
      paddingHorizontal: 16,
      gap: 12,
    },
    gardenCard: {
      width: 200,
      height: 120,
      backgroundColor: theme.card,
      borderRadius: 16,
      overflow: "hidden",
      elevation: 2,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    gardenImage: {
      width: "100%",
      height: 80,
      resizeMode: "cover",
    },
    gardenInfo: {
      padding: 8,
    },
    gardenName: {
      fontSize: 14,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginBottom: 4,
    },
    gardenTypeContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    gardenType: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      textTransform: "capitalize",
    },
    pinButton: {
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 4,
      elevation: 2,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
  });
