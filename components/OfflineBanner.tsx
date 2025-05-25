import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { useNetwork } from "@/contexts/NetworkContext";

// Mock NetInfo for environments where the native module isn't available
const NetInfoMock = {
  configure: () => {},
  addEventListener: (callback: any) => {
    // Always return connected in mock mode
    setTimeout(() => {
      callback({
        isConnected: true,
        isInternetReachable: true,
      });
    }, 0);
    return () => {}; // Unsubscribe function
  },
  fetch: () =>
    Promise.resolve({ isConnected: true, isInternetReachable: true }),
};

// Use real NetInfo when available, otherwise use mock
let NetInfo: any;
try {
  NetInfo = require("@react-native-community/netinfo").default;
} catch (error) {
  console.warn(
    "NetInfo not available in OfflineBanner, using mock implementation"
  );
  NetInfo = NetInfoMock;
}

const { width } = Dimensions.get("window");

const OfflineBanner = () => {
  const theme = useAppTheme();
  const networkContext = useNetwork();
  const [isConnected, setIsConnected] = useState<boolean | null>(
    networkContext.isConnected
  );
  const [visible, setVisible] = useState(false);
  const bannerHeight = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const lastConnectionCheck = useRef<Date | null>(null);

  useEffect(() => {
    // Use the network context as the primary source of truth
    setIsConnected(
      networkContext.isConnected && networkContext.isInternetReachable
    );

    const unsubscribe = NetInfo.addEventListener((state: any) => {
      const connectionStatus =
        state?.isConnected !== false && state?.isInternetReachable !== false;

      // Avoid flickering by requiring multiple checks to go back online
      if (!isConnected && connectionStatus) {
        const now = new Date();
        // If last check was less than 3 seconds ago, ignore this change
        if (
          lastConnectionCheck.current &&
          now.getTime() - lastConnectionCheck.current.getTime() < 3000
        ) {
          return;
        }
        lastConnectionCheck.current = now;
      }

      setIsConnected(connectionStatus);

      if (!connectionStatus && !visible) {
        setVisible(true);
        Animated.parallel([
          Animated.timing(bannerHeight, {
            toValue: 50,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
          }),
        ]).start();
      } else if (connectionStatus && visible) {
        Animated.parallel([
          Animated.timing(bannerHeight, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
        ]).start(() => {
          setVisible(false);
        });
      }
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [isConnected, visible, networkContext]);

  const checkConnection = () => {
    NetInfo.fetch().then((state: any) => {
      const connectionStatus =
        state?.isConnected !== false && state?.isInternetReachable !== false;
      setIsConnected(connectionStatus);
    });
  };

  // In development or when NetInfo is mocked, we don't show the banner
  if (
    process.env.NODE_ENV === "development" ||
    !visible ||
    isConnected !== false
  ) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          height: bannerHeight,
          opacity,
          backgroundColor: theme.error || "#FF3B30",
        },
      ]}
    >
      <View style={styles.contentContainer}>
        <Ionicons name="cloud-offline-outline" size={18} color="#FFFFFF" />
        <Text style={styles.text}>Không có kết nối mạng</Text>
      </View>
      <TouchableOpacity style={styles.retryButton} onPress={checkConnection}>
        <Ionicons name="refresh-outline" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: width,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    zIndex: 1000,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    color: "#FFFFFF",
    marginLeft: 8,
    fontWeight: "500",
    fontSize: 14,
  },
  retryButton: {
    padding: 5,
  },
});

export default OfflineBanner;
