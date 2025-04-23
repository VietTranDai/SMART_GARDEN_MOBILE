import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Appearance, useColorScheme } from "react-native";
import { getItem, setItem } from "@/utils/asyncStorage";
import { StatusBar } from "expo-status-bar";
import { animateThemeTransition, debounce } from "@/utils/themeUtils";

type ThemeMode = "light" | "dark" | "system";

export interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  effectiveColorScheme: "light" | "dark";
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const deviceColorScheme = useColorScheme();
  const systemColorScheme = (
    typeof deviceColorScheme === "string" ? deviceColorScheme : "light"
  ) as "light" | "dark";

  const [theme, setThemeState] = useState<ThemeMode>("system");
  // Tính toán effectiveColorScheme dựa trên theme và systemColorScheme
  const effectiveColorScheme = useMemo(
    () => (theme === "system" ? systemColorScheme : theme),
    [theme, systemColorScheme]
  );

  const isDarkMode = effectiveColorScheme === "dark";
  const isUpdatingRef = useRef(false);
  const lastUpdateTimeRef = useRef(0);

  // Load theme đã lưu khi khởi tạo
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = (await getItem("@theme")) as string;
        if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
          setThemeState(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.error("Failed to load theme preference:", error);
      }
    };

    loadTheme();
  }, []);

  // Lắng nghe sự thay đổi của hệ thống khi theme là "system"
  useEffect(() => {
    const subscription = Appearance.addChangeListener(
      ({ colorScheme: newColorScheme }) => {
        if (
          theme === "system" &&
          typeof newColorScheme === "string" &&
          !isUpdatingRef.current
        ) {
          animateThemeTransition();
          // Khi thay đổi hệ thống, effectiveColorScheme sẽ tự động được tính lại
        }
      }
    );
    return () => subscription.remove();
  }, [theme]);

  // Debounced save function để tránh ghi quá nhiều
  const saveThemePreference = useCallback(
    debounce(async (newTheme: ThemeMode) => {
      try {
        await setItem("@theme", newTheme);
        isUpdatingRef.current = false;
      } catch (error) {
        console.error("Failed to save theme preference:", error);
        isUpdatingRef.current = false;
      }
    }, 500),
    []
  );

  // Hàm setTheme có animation và throttle
  const setTheme = useCallback(
    (newTheme: ThemeMode) => {
      if (!["light", "dark", "system"].includes(newTheme)) {
        console.error("Invalid theme value:", newTheme);
        return;
      }

      const now = Date.now();
      if (isUpdatingRef.current && now - lastUpdateTimeRef.current < 700) {
        console.log("Throttling theme change - too soon");
        return;
      }

      if (newTheme !== theme) {
        isUpdatingRef.current = true;
        lastUpdateTimeRef.current = now;
        animateThemeTransition();
        setThemeState(newTheme);
        saveThemePreference(newTheme);
      }
    },
    [theme, saveThemePreference]
  );

  // Hàm toggleTheme để chuyển đổi theme
  const toggleTheme = useCallback(() => {
    if (isUpdatingRef.current) return;

    const newTheme =
      theme === "system"
        ? effectiveColorScheme === "dark"
          ? "light"
          : "dark"
        : theme === "dark"
        ? "light"
        : "dark";

    setTheme(newTheme);
  }, [theme, effectiveColorScheme, setTheme]);

  useEffect(() => {
    return () => {
      if (typeof (saveThemePreference as any).cancel === "function") {
        (saveThemePreference as any).cancel();
      }
    };
  }, [saveThemePreference]);

  const contextValue = {
    theme,
    setTheme,
    effectiveColorScheme,
    toggleTheme,
    isDarkMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
