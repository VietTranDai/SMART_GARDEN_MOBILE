import { Stack } from "expo-router";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function AlertsLayout() {
  const theme = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.primary,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontFamily: "Inter-SemiBold",
        },
        headerBackTitle: "",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Cảnh báo",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Chi tiết cảnh báo",
          headerShown: true,
        }}
      />
    </Stack>
  );
}
