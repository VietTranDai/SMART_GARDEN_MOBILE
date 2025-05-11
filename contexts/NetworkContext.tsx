import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Animated } from "react-native";

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
  console.warn("NetInfo not available, using mock implementation");
  NetInfo = NetInfoMock;
}

interface NetworkContextType {
  isConnected: boolean;
  isInternetReachable: boolean | null;
}

const NetworkContext = createContext<NetworkContextType>({
  isConnected: true,
  isInternetReachable: true,
});

export const useNetwork = () => useContext(NetworkContext);

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider = ({ children }: NetworkProviderProps) => {
  const [networkState, setNetworkState] = useState<NetworkContextType>({
    isConnected: true,
    isInternetReachable: true,
  });

  // Animation for the offline banner
  const [offlineBannerHeight] = useState(new Animated.Value(0));
  const [isOfflineBannerVisible, setIsOfflineBannerVisible] = useState(false);

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state: any) => {
      const isConnected = state?.isConnected !== false; // Default to true if undefined
      const isInternetReachable = state?.isInternetReachable !== false; // Default to true if undefined

      setNetworkState({
        isConnected,
        isInternetReachable,
      });

      if (!isConnected || !isInternetReachable) {
        showOfflineBanner();
      } else {
        hideOfflineBanner();
      }
    });

    // Initial network check
    NetInfo.fetch().then((state: any) => {
      const isConnected = state?.isConnected !== false;
      const isInternetReachable = state?.isInternetReachable !== false;

      setNetworkState({
        isConnected,
        isInternetReachable,
      });

      if (!isConnected || !isInternetReachable) {
        showOfflineBanner();
      }
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  const showOfflineBanner = () => {
    if (!isOfflineBannerVisible) {
      setIsOfflineBannerVisible(true);
      Animated.timing(offlineBannerHeight, {
        toValue: 40,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const hideOfflineBanner = () => {
    if (isOfflineBannerVisible) {
      Animated.timing(offlineBannerHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setIsOfflineBannerVisible(false);
      });
    }
  };

  return (
    <NetworkContext.Provider value={networkState}>
      {children}
    </NetworkContext.Provider>
  );
};
