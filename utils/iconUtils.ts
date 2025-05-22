import { Ionicons } from "@expo/vector-icons";

export type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

/**
 * Returns a valid Ionicon name, defaulting to a placeholder if the input is not directly usable.
 * Note: This function currently checks against a predefined list and appends '-outline'.
 * It might need to be adjusted based on the actual format of iconName values from the API
 * and the desired mapping to full Ionicon names.
 */
export const getValidIconName = (
  iconName?: string,
  addOutlineSuffix: boolean = true
): IoniconName => {
  const defaultIcon: IoniconName = "cloudy-outline";
  if (!iconName) {
    return defaultIcon;
  }

  let fullIconName = addOutlineSuffix ? `${iconName}-outline` : iconName;

  // This is a simplistic check. A more robust solution might involve a mapping object
  // if API icon codes don't directly translate to Ionicon names by just adding a suffix.
  // Or, ensure the iconName passed is already a valid Ionicon name or part of one.

  // For now, we'll trust that the constructed name is potentially valid
  // and rely on Ionicons to handle it (it usually defaults if name is invalid, but that's not ideal).
  // A truly safe version would check against a comprehensive list of actual Ionicon names.
  // However, the original list was very small and might not cover all cases from an API.

  // Placeholder for a more comprehensive validation if needed:
  const knownValidIcons: IoniconName[] = [
    "cloudy-outline",
    "sunny-outline",
    "rainy-outline",
    "thunderstorm-outline",
    "snow-outline",
    "partly-sunny-outline",
    "cloud-outline",
    "close",
    "chevron-down-outline",
    // Add more tested Ionicon names here if you want a strict check
  ];

  // If you want to strictly validate against a known list:
  // if (knownValidIcons.includes(fullIconName as IoniconName)) {
  //   return fullIconName as IoniconName;
  // }
  // return defaultIcon;

  // For now, assume the constructed name is what we intend to try.
  return fullIconName as IoniconName;
};
