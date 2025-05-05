import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the types for home screen preferences
export type HomePreferences = {
  pinnedGardens: number[];
  lastVisitedGarden: number | null;
  defaultView: "compact" | "detailed";
};

// Define the context type
type PreferencesContextType = {
  homePreferences: HomePreferences;
  isLoading: boolean;
  error: string | null;
  updateHomePreferences: (
    preferences: Partial<HomePreferences>
  ) => Promise<void>;
  togglePinnedGarden: (gardenId: number) => Promise<void>;
  setLastVisitedGarden: (gardenId: number) => Promise<void>;
  resetPreferences: () => Promise<void>;
};

// Default preferences values
const DEFAULT_HOME_PREFERENCES: HomePreferences = {
  pinnedGardens: [],
  lastVisitedGarden: null,
  defaultView: "detailed",
};

// Storage keys
const STORAGE_KEYS = {
  HOME_PREFERENCES: "home_preferences",
};

// Create the context
const PreferencesContext = createContext<PreferencesContextType | undefined>(
  undefined
);

export function PreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [homePreferences, setHomePreferences] = useState<HomePreferences>(
    DEFAULT_HOME_PREFERENCES
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load preferences from storage on initial mount
  useEffect(() => {
    async function loadPreferences() {
      try {
        setIsLoading(true);
        const storedPrefs = await AsyncStorage.getItem(
          STORAGE_KEYS.HOME_PREFERENCES
        );

        if (storedPrefs) {
          setHomePreferences(JSON.parse(storedPrefs));
        } else {
          // If no stored preferences, use defaults
          setHomePreferences(DEFAULT_HOME_PREFERENCES);
        }
        setError(null);
      } catch (error) {
        console.error("Failed to load preferences:", error);
        setError("Failed to load user preferences");
      } finally {
        setIsLoading(false);
      }
    }

    loadPreferences();
  }, []);

  // Function to update home preferences
  const updateHomePreferences = async (
    preferences: Partial<HomePreferences>
  ): Promise<void> => {
    try {
      setIsLoading(true);
      const updatedPreferences = {
        ...homePreferences,
        ...preferences,
      };

      // Save to state
      setHomePreferences(updatedPreferences);

      // Save to storage
      await AsyncStorage.setItem(
        STORAGE_KEYS.HOME_PREFERENCES,
        JSON.stringify(updatedPreferences)
      );

      setError(null);
    } catch (error) {
      console.error("Failed to update preferences:", error);
      setError("Failed to save preferences");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to toggle a garden's pinned status
  const togglePinnedGarden = async (gardenId: number): Promise<void> => {
    try {
      const pinnedGardens = [...homePreferences.pinnedGardens];
      const index = pinnedGardens.indexOf(gardenId);

      if (index > -1) {
        // Remove if already pinned
        pinnedGardens.splice(index, 1);
      } else {
        // Add if not pinned
        pinnedGardens.push(gardenId);
      }

      await updateHomePreferences({ pinnedGardens });
    } catch (error) {
      console.error("Failed to toggle pinned garden:", error);
      throw error;
    }
  };

  // Function to set the last visited garden
  const setLastVisitedGarden = async (gardenId: number): Promise<void> => {
    try {
      await updateHomePreferences({ lastVisitedGarden: gardenId });
    } catch (error) {
      console.error("Failed to update last visited garden:", error);
      throw error;
    }
  };

  // Function to reset all preferences to defaults
  const resetPreferences = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await AsyncStorage.removeItem(STORAGE_KEYS.HOME_PREFERENCES);
      setHomePreferences(DEFAULT_HOME_PREFERENCES);
      setError(null);
    } catch (error) {
      console.error("Failed to reset preferences:", error);
      setError("Failed to reset preferences");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: PreferencesContextType = {
    homePreferences,
    isLoading,
    error,
    updateHomePreferences,
    togglePinnedGarden,
    setLastVisitedGarden,
    resetPreferences,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

// Custom hook for using the preferences context
export function usePreferences(): PreferencesContextType {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
}
