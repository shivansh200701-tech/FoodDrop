import React, { useMemo, useState } from "react";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from "react-native";
import * as Location from "expo-location";
import { createListing } from "../services/listings";
import { pickImageUri, uploadToCloudinary } from "../services/images";

export function PostFoodScreen() {
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [foodType, setFoodType] = useState<"veg" | "non-veg" | "cooked" | "raw">("veg");
  const [isRestaurant, setIsRestaurant] = useState(false);
  const [pickupStart, setPickupStart] = useState("");
  const [pickupEnd, setPickupEnd] = useState("");
  const [prepTime, setPrepTime] = useState(new Date().toISOString());
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const canSubmit = useMemo(
    () => Boolean(foodName && quantity && pickupStart && pickupEnd && imageUri),
    [foodName, quantity, pickupStart, pickupEnd, imageUri]
  );

  const onPickImage = async () => {
    const uri = await pickImageUri();
    if (uri) setImageUri(uri);
  };

  const onSubmit = async () => {
    if (!canSubmit || !imageUri) return;

    try {
      setSaving(true);
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") throw new Error("Location permission is required to post");

      const position = await Location.getCurrentPositionAsync({});
      const imageUrl = await uploadToCloudinary(imageUri);

      await createListing({
        userType: isRestaurant ? "hotel" : "home",
        foodName,
        quantity,
        foodType,
        prepTime,
        imageUrl,
        location: { lat: position.coords.latitude, lng: position.coords.longitude },
        pickupWindow: { startAt: pickupStart, endAt: pickupEnd }
      });

      setFoodName("");
      setQuantity("");
      setPickupStart("");
      setPickupEnd("");
      setImageUri(null);
      setPrepTime(new Date().toISOString());
      Alert.alert("Posted", "Your listing is now live.");
    } catch (err) {
      Alert.alert("Unable to post", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Post Food</Text>

      <TextInput placeholder="Food name" style={styles.input} value={foodName} onChangeText={setFoodName} />
      <TextInput placeholder="Quantity (e.g. 3 plates)" style={styles.input} value={quantity} onChangeText={setQuantity} />
      <TextInput
        placeholder="Food type (veg/non-veg/cooked/raw)"
        style={styles.input}
        value={foodType}
        onChangeText={(text) => setFoodType((text as typeof foodType) || "veg")}
      />
      <TextInput
        placeholder="Pickup window start (ISO datetime)"
        style={styles.input}
        value={pickupStart}
        onChangeText={setPickupStart}
      />
      <TextInput
        placeholder="Pickup window end (ISO datetime)"
        style={styles.input}
        value={pickupEnd}
        onChangeText={setPickupEnd}
      />

      <View style={styles.switchRow}>
        <Text>Restaurant account</Text>
        <Switch value={isRestaurant} onValueChange={setIsRestaurant} />
      </View>

      <View style={styles.buttonSpacing}>
        <Button title={imageUri ? "Change Photo" : "Pick Photo"} onPress={onPickImage} />
      </View>

      {imageUri ? <Text style={styles.imageLabel}>Photo selected ✓</Text> : null}

      <Button title={saving ? "Posting..." : "Post Listing"} disabled={!canSubmit || saving} onPress={onSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 10
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6
  },
  input: {
    borderWidth: 1,
    borderColor: "#d8d8d8",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff"
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  buttonSpacing: {
    marginVertical: 8
  },
  imageLabel: {
    color: "#1f7a1f",
    fontWeight: "600"
  }
});
