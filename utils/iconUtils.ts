import { Ionicons } from "@expo/vector-icons";

export type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

/**
 * Returns a valid Ionicon name, defaulting to a placeholder if the input is not directly usable.
 * Note: This function currently checks against a predefined list and appends '-outline'.
 * It might need to be adjusted based on the actual format of iconName values from the API
 * and the desired mapping to full Ionicon names.
 */
export const getValidIconName = (
  iconCode?: string,
  addOutlineSuffix: boolean = true
): IoniconName => {
  const defaultIcon: IoniconName = "cloud-outline";

  if (!iconCode) {
    return defaultIcon;
  }

  // Mapping from common weather API icon codes to Ionicon names
  const iconMap: Record<string, IoniconName> = {
    "01d": "sunny-outline",
    "01n": "moon-outline",
    "02d": "partly-sunny-outline",
    "02n": "cloudy-night-outline",
    "03d": "cloud-outline", // Scattered clouds day
    "03n": "cloud-outline", // Scattered clouds night - using same as day for simplicity
    "04d": "cloudy-outline", // Broken clouds day
    "04n": "cloudy-outline", // Broken clouds night
    "09d": "rainy-outline", // Shower rain day
    "09n": "rainy-outline", // Shower rain night
    "10d": "rainy-outline", // Rain day
    "10n": "rainy-outline", // Rain night
    "11d": "thunderstorm-outline",
    "11n": "thunderstorm-outline",
    "13d": "snow-outline",
    "13n": "snow-outline",
    "50d": "reorder-three-outline", // Mist day (using a generic fog/mist icon)
    "50n": "reorder-three-outline", // Mist night
    // Add more mappings as needed based on your API's icon codes
  };

  // Check if the iconCode (without suffix) is in our map
  if (iconMap[iconCode]) {
    return iconMap[iconCode];
  }

  // Fallback if iconCode is not in the map - try to use it directly or with suffix
  // This part retains some of the old logic but is less likely to be hit if the map is comprehensive
  let fullIconName = addOutlineSuffix ? `${iconCode}-outline` : iconCode;

  // A simple check to see if the constructed name looks like a plausible Ionicon name
  // This is not foolproof and relies on Ionicons handling unknown names gracefully.
  // Consider removing this or making it more robust if issues persist.
  if (fullIconName.includes("-outline")) {
    // @ts-ignore - Bypassing strict type check for dynamic name
    return fullIconName as IoniconName;
  }

  // If all else fails, return the default icon
  return defaultIcon;
};
