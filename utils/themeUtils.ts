import {
  LayoutAnimation,
  Platform,
  UIManager,
  InteractionManager,
} from "react-native";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Configure animation for theme transitions with platform-specific optimizations
 * This makes the theme change look smooth instead of abrupt
 */
export const animateThemeTransition = () => {
  try {
    if (Platform.OS === "ios") {
      // Use gentler animation for iOS to avoid potential glitches
      InteractionManager.runAfterInteractions(() => {
        LayoutAnimation.configureNext({
          duration: 250,
          update: {
            type: LayoutAnimation.Types.easeInEaseOut,
            property: LayoutAnimation.Properties.opacity,
          },
        });
      });
    } else {
      // Regular animation for Android
      LayoutAnimation.configureNext({
        duration: 300,
        update: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
        create: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
      });
    }
  } catch (error) {
    // Log the error but don't crash if animation fails
    console.warn("Theme transition animation failed:", error);
  }
};

/**
 * Improved debounce utility to prevent double-toggling issues
 * This version handles invalid inputs better and cleans up resources properly
 */
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number = 300
) => {
  if (typeof func !== "function") {
    console.error("Debounce requires a function as first argument");
    return ((...args: any[]) => {}) as (
      ...args: Parameters<F>
    ) => ReturnType<F>;
  }

  let timeout: ReturnType<typeof setTimeout> | null = null;
  let isCancelled = false;

  const debounced = (...args: Parameters<F>) => {
    if (isCancelled) return;

    if (timeout !== null) {
      clearTimeout(timeout);
    }

    try {
      timeout = setTimeout(() => {
        if (isCancelled) return;
        try {
          func(...args);
        } catch (error) {
          console.error("Error in debounced function:", error);
        } finally {
          timeout = null;
        }
      }, waitFor);
    } catch (error) {
      console.error("Error setting up debounced timer:", error);
    }
  };

  // Add a cancel method to clean up resources
  (debounced as any).cancel = () => {
    isCancelled = true;
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced as (...args: Parameters<F>) => ReturnType<F>;
};
