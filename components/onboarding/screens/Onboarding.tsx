import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  Animated,
  ViewToken,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { onboardingData } from "../data/onboardingData";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/contexts/ThemeContext";
import { setItem } from "@/utils/asyncStorage";
import { ONBOARDING_COMPLETED_KEY } from "@/constants/strings";

const { width, height } = Dimensions.get("window");

// Create placeholder images until real ones are provided
const placeholderImages = {
  welcome: {
    uri: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e",
  },
  gardens: {
    uri: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b",
  },
  monitoring: {
    uri: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2",
  },
  notifications: {
    uri: "https://images.unsplash.com/photo-1505142468610-359e7d316be0",
  },
  getStarted: {
    uri: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2",
  },
};

interface ViewableItemsChanged {
  viewableItems: ViewToken[];
  changed: ViewToken[];
}

export default function OnboardingScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const { effectiveColorScheme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(
    ({ viewableItems }: ViewableItemsChanged) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index || 0);
      }
    }
  ).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = (index: number) => {
    if (slidesRef.current) {
      slidesRef.current.scrollToIndex({ index });
    }
  };

  const nextSlide = () => {
    if (currentIndex < onboardingData.length - 1) {
      scrollTo(currentIndex + 1);
    } else {
      finishOnboarding();
    }
  };

  const skipOnboarding = async () => {
    try {
      await setItem(ONBOARDING_COMPLETED_KEY, "true");
      router.replace("/(modules)/home");
    } catch (error) {
      console.error("Failed to set onboarding completed on skip:", error);
      router.replace("/(modules)/home");
    }
  };

  const finishOnboarding = async () => {
    try {
      await setItem(ONBOARDING_COMPLETED_KEY, "true");
      router.replace("/(modules)/home");
    } catch (error) {
      console.error("Failed to set onboarding completed:", error);
      router.replace("/(modules)/home");
    }
  };

  const getImageSource = (id: string) => {
    try {
      switch (id) {
        case "1":
          return placeholderImages.welcome;
        case "2":
          return placeholderImages.gardens;
        case "3":
          return placeholderImages.monitoring;
        case "4":
          return placeholderImages.notifications;
        case "5":
          return placeholderImages.getStarted;
        default:
          return placeholderImages.welcome;
      }
    } catch (error) {
      console.error("Failed to get image source:", error);

      return {
        uri: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b",
      };
    }
  };

  const renderItem = ({ item }: { item: (typeof onboardingData)[0] }) => {
    return (
      <View
        style={[styles.slide, { width, backgroundColor: theme.background }]}
      >
        <View style={styles.imageContainer}>
          <Image
            source={getImageSource(item.id)}
            style={styles.image}
            resizeMode="cover"
          />
          <View
            style={[styles.imageCover, { backgroundColor: theme.background }]}
          />
          <View style={styles.iconOverlay}>
            <Ionicons
              name={
                item.id === "1"
                  ? "leaf"
                  : item.id === "2"
                    ? "grid"
                    : item.id === "3"
                      ? "analytics"
                      : item.id === "4"
                        ? "notifications"
                        : "sunny"
              }
              size={60}
              color={theme.primary}
            />
          </View>
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {item.description}
          </Text>
        </View>
      </View>
    );
  };

  const Paginator = () => {
    return (
      <View style={styles.paginationContainer}>
        {onboardingData.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 20, 8],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={`dot-${i}`}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity,
                  backgroundColor: theme.primary,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={effectiveColorScheme === "light" ? "light" : "dark"} />

      {currentIndex < onboardingData.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={skipOnboarding}>
          <Text style={[styles.skipText, { color: theme.primary }]}>Skip</Text>
        </TouchableOpacity>
      )}

      <Animated.FlatList
        ref={slidesRef}
        data={onboardingData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        scrollEventThrottle={32}
      />

      <Paginator />

      <View style={styles.bottomContainer}>
        {currentIndex < onboardingData.length - 1 ? (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={nextSlide}
          >
            <Text style={styles.buttonText}>Next</Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color="white"
              style={styles.buttonIcon}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={finishOnboarding}
          >
            <Text style={styles.buttonText}>Get Started</Text>
            <Ionicons
              name="checkmark"
              size={20}
              color="white"
              style={styles.buttonIcon}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
    width: width * 0.9,
    height: height * 0.5,
    borderRadius: 24,
    overflow: "hidden",
    marginTop: 20,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageCover: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
  },
  iconOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 0.4,
    paddingHorizontal: 40,
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontSize: 17,
    textAlign: "center",
    lineHeight: 24,
  },
  bottomContainer: {
    width: "100%",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  paginationContainer: {
    flexDirection: "row",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  button: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  buttonIcon: {
    marginLeft: 8,
  },
  skipButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
