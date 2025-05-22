import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
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
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      <GardenPhotoGallery
        photos={photos}
        gardenId={gardenId}
        onUploadRequested={initiatePhotoUpload}
        isLoading={isLoading}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default GardenPhotosTab;
