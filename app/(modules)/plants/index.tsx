import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter, Redirect } from "expo-router";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function PlantsTabPage() {
  const theme = useAppTheme();
  const router = useRouter();

  useEffect(() => {
    router.replace("/plants");
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );
}
