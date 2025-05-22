import { useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { gardenService } from "@/service/api";
import Toast from "react-native-toast-message";
import { GardenPhoto } from "@/types";

interface UseGardenPhotosReturn {
  handleUploadPhoto: (gardenId: string | number) => Promise<void>;
}

export const useGardenPhotos = (
  onPhotoUploaded?: (photo: GardenPhoto) => void
): UseGardenPhotosReturn => {
  const handleUploadPhoto = useCallback(
    async (gardenId: string | number) => {
      try {
        // Ask for permission
        const permissionResult =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
          Toast.show({
            type: "error",
            text1: "Cần quyền truy cập thư viện ảnh",
            text2: "Vui lòng cấp quyền để tải ảnh lên",
            position: "bottom",
            visibilityTime: 3000,
          });
          return;
        }

        // Pick an image
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const selectedImage = result.assets[0];

          // Create form data for upload
          const formData = new FormData();
          formData.append("file", {
            uri: selectedImage.uri,
            type: "image/jpeg",
            name: `garden-${gardenId}-${new Date().getTime()}.jpg`,
          } as any);

          Toast.show({
            type: "info",
            text1: "Đang tải ảnh lên...",
            position: "bottom",
            visibilityTime: 2000,
          });

          // Upload the image
          const response = await gardenService.uploadPhoto(gardenId, formData);

          if (response && onPhotoUploaded) {
            onPhotoUploaded(response);
          }

          Toast.show({
            type: "success",
            text1: "Đã tải ảnh lên thành công",
            position: "bottom",
            visibilityTime: 2000,
          });
        }
      } catch (error) {
        console.error("Error uploading photo:", error);

        Toast.show({
          type: "error",
          text1: "Lỗi tải ảnh lên",
          text2: "Vui lòng thử lại sau",
          position: "bottom",
          visibilityTime: 3000,
        });
      }
    },
    [onPhotoUploaded]
  );

  return {
    handleUploadPhoto,
  };
};
