import React from "react";
import { StyleSheet, View } from "react-native";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { GardenPhoto } from "@/types";
import GardenPhotoGallery from "@/components/garden/GardenPhotoGallery";

interface GardenPhotosTabProps {
  photos: GardenPhoto[];
  gardenId: string | number;
  initiatePhotoUpload: () => Promise<void>;
  isLoading: boolean;
}

const GardenPhotosTab: React.FC<GardenPhotosTabProps> = ({
  photos,
  gardenId,
  initiatePhotoUpload,
  isLoading,
}) => {
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GardenPhotoGallery
        photos={photos}
        gardenId={gardenId}
        onUploadRequested={initiatePhotoUpload}
        isLoading={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default GardenPhotosTab;
