import * as ImagePicker from "expo-image-picker";

interface UploadResponse {
  secure_url: string;
}

export async function pickImageUri(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.6,
    allowsEditing: true
  });

  if (result.canceled || !result.assets.length) return null;
  return result.assets[0].uri;
}

export async function uploadToCloudinary(localUri: string): Promise<string> {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Missing Cloudinary configuration");
  }

  const data = new FormData();
  data.append("file", {
    uri: localUri,
    type: "image/jpeg",
    name: "fooddrop.jpg"
  } as unknown as Blob);
  data.append("upload_preset", uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: data
  });

  if (!response.ok) throw new Error("Cloudinary upload failed");
  const json = (await response.json()) as UploadResponse;
  return json.secure_url;
}
