import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Garden, GardenType } from "@/types/gardens/garden.types";
import { UpdateGardenDto } from "@/types/gardens/dtos";
import { gardenService } from "@/service/api";
import { Ionicons } from "@expo/vector-icons";
// import ImagePicker from 'react-native-image-picker'; // We'll handle image picking later
// For now, a placeholder for profile picture URL
import { Image } from "expo-image";
import env from "@/config/environment";

interface CustomPickerProps {
  label: string;
  selectedValue: GardenType | undefined; // Or the specific type of your value
  onValueChange: (value: GardenType) => void; // Or the specific type
  items: Array<{ label: string; value: GardenType }>; // Or the specific type
  theme: any; // You might have a more specific theme type
}

// Simple Picker component (can be replaced with a more sophisticated one later)
const CustomPicker = ({
  label,
  selectedValue,
  onValueChange,
  items,
  theme,
}: CustomPickerProps) => (
  <View style={styles.inputContainer}>
    <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
    {/* Basic picker for now, can be improved with a modal or dropdown component */}
    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
      {items.map((item: any) => (
        <TouchableOpacity
          key={item.value}
          style={[
            styles.pickerItem,
            {
              backgroundColor:
                selectedValue === item.value
                  ? theme.primary
                  : theme.borderLight,
            },
          ]}
          onPress={() => onValueChange(item.value)}
        >
          <Text
            style={{
              color: selectedValue === item.value ? theme.card : theme.text,
            }}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export default function EditGardenScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [garden, setGarden] = useState<Garden | null>(null);
  const [formData, setFormData] = useState<Partial<UpdateGardenDto>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGardenDetails = useCallback(async () => {
    if (!id) {
      setError("Garden ID is missing.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const fetchedGarden = await gardenService.getGardenById(id);
      if (fetchedGarden) {
        setGarden(fetchedGarden);
        setFormData({
          name: fetchedGarden.name,
          description: fetchedGarden.description,
          street: fetchedGarden.street,
          ward: fetchedGarden.ward,
          district: fetchedGarden.district,
          city: fetchedGarden.city,
          type: fetchedGarden.type,
          profilePicture: fetchedGarden.profilePicture, // Keep existing picture by default
        });
      } else {
        setError("Không thể tải thông tin khu vườn.");
      }
    } catch (err) {
      console.error("Error fetching garden details for edit:", err);
      setError("Đã có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGardenDetails();
  }, [fetchGardenDetails]);

  const handleInputChange = (field: keyof UpdateGardenDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Placeholder for image picking functionality
  const handleChoosePhoto = () => {
    Alert.alert("Thông báo", "Chức năng chọn ảnh sẽ được triển khai sau.");
    // Example:
    // const options = {};
    // ImagePicker.launchImageLibrary(options, response => {
    //   if (response.uri) {
    //     handleInputChange('profilePicture', response.uri);
    //   }
    // });
  };

  const handleSaveChanges = async () => {
    if (!id || !garden) return;

    // Client-side validation
    if (!formData.name || formData.name.trim() === "") {
      Alert.alert("Lỗi", "Tên khu vườn không được để trống.");
      return;
    }
    if (!formData.type) {
      Alert.alert("Lỗi", "Vui lòng chọn loại khu vườn.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const updatePayload: UpdateGardenDto = {
      name: formData.name || garden.name,
      type: formData.type || garden.type,
      description: formData.description,
      street: formData.street,
      ward: formData.ward,
      district: formData.district,
      city: formData.city,
      profilePicture: formData.profilePicture, // This might need to be handled as FormData if uploading a new file
    };

    try {
      const updatedGarden = await gardenService.updateGarden(id, updatePayload);
      if (updatedGarden) {
        Alert.alert("Thành công", "Thông tin khu vườn đã được cập nhật.");
        // Potentially refresh the previous screen's data or rely on its own refresh mechanism
        router.back();
      } else {
        setError("Không thể cập nhật khu vườn. Vui lòng thử lại.");
      }
    } catch (err: any) {
      console.error("Error updating garden:", err);
      setError(err.message || "Đã có lỗi xảy ra khi lưu thay đổi.");
      Alert.alert("Lỗi", err.message || "Đã có lỗi xảy ra khi lưu thay đổi.");
    } finally {
      setIsSaving(false);
    }
  };

  const gardenTypeItems = Object.values(GardenType).map((type) => ({
    label: gardenService.getGardenTypeText(type), // Use existing helper
    value: type,
  }));

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ marginTop: 10, color: theme.textSecondary }}>
          Đang tải...
        </Text>
      </View>
    );
  }

  if (error && !garden) {
    // Show full page error if garden couldn't be loaded
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.background },
        ]}
      >
        <Ionicons name="alert-circle-outline" size={48} color={theme.error} />
        <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentProfilePicture =
    formData.profilePicture || garden?.profilePicture;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack.Screen options={{ title: "Chỉnh sửa khu vườn" }} />
      <ScrollView contentContainerStyle={[styles.container, { padding: 20 }]}>
        <Text style={[styles.title, { color: theme.text }]}>
          Chỉnh sửa thông tin
        </Text>

        {/* Profile Picture */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Ảnh đại diện
          </Text>
          <TouchableOpacity
            onPress={handleChoosePhoto}
            style={styles.imagePicker}
          >
            {currentProfilePicture ? (
              <Image
                source={{
                  uri: currentProfilePicture.startsWith("http")
                    ? currentProfilePicture
                    : `${env.apiUrl}${currentProfilePicture}`,
                }}
                style={styles.profileImage}
                placeholder={require("@/assets/images/garden-placeholder.png")}
                transition={300}
                contentFit="cover"
              />
            ) : (
              <View
                style={[
                  styles.profileImagePlaceholder,
                  { backgroundColor: theme.borderLight },
                ]}
              >
                <Ionicons name="camera" size={40} color={theme.textSecondary} />
                <Text style={{ color: theme.textSecondary, marginTop: 5 }}>
                  Chọn ảnh
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Garden Name */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Tên khu vườn *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={formData.name}
            onChangeText={(text) => handleInputChange("name", text)}
            placeholder="Ví dụ: Vườn rau sân thượng"
            placeholderTextColor={theme.textTertiary}
          />
        </View>

        {/* Garden Type */}
        <CustomPicker
          label="Loại khu vườn *"
          selectedValue={formData.type}
          onValueChange={(value: GardenType) =>
            handleInputChange("type", value)
          }
          items={gardenTypeItems}
          theme={theme}
        />

        {/* Description */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Mô tả
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={formData.description}
            onChangeText={(text) => handleInputChange("description", text)}
            placeholder="Mô tả ngắn về khu vườn của bạn..."
            placeholderTextColor={theme.textTertiary}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Location Fields */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Địa chỉ
        </Text>
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Đường/Số nhà
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={formData.street}
            onChangeText={(text) => handleInputChange("street", text)}
            placeholder="Ví dụ: 123 Đường ABC"
            placeholderTextColor={theme.textTertiary}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Phường/Xã
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={formData.ward}
            onChangeText={(text) => handleInputChange("ward", text)}
            placeholder="Ví dụ: Phường Bến Nghé"
            placeholderTextColor={theme.textTertiary}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Quận/Huyện
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={formData.district}
            onChangeText={(text) => handleInputChange("district", text)}
            placeholder="Ví dụ: Quận 1"
            placeholderTextColor={theme.textTertiary}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Tỉnh/Thành phố
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={formData.city}
            onChangeText={(text) => handleInputChange("city", text)}
            placeholder="Ví dụ: TP. Hồ Chí Minh"
            placeholderTextColor={theme.textTertiary}
          />
        </View>

        {error && (
          <Text
            style={[styles.errorText, { color: theme.error, marginTop: 10 }]}
          >
            {error}
          </Text>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.primary },
            isSaving && styles.buttonDisabled,
          ]}
          onPress={handleSaveChanges}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={theme.card} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.card }]}>
              Lưu thay đổi
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: theme.background,
              marginTop: 10,
              borderWidth: 1,
              borderColor: theme.border,
            },
          ]}
          onPress={() => router.back()}
          disabled={isSaving}
        >
          <Text style={[styles.buttonText, { color: theme.text }]}>Hủy</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter-SemiBold",
    marginBottom: 20,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter-Medium",
    marginTop: 20,
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    fontSize: 16,
    fontFamily: "Inter-Regular",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  errorText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    textAlign: "center",
    marginBottom: 10,
  },
  // Image Picker Styles
  imagePicker: {
    alignItems: "center",
    marginBottom: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
  },
  // Custom Picker Styles
  pickerItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
});
