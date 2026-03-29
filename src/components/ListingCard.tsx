import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Listing } from "../types/listing";
import { FreshnessBadge } from "./FreshnessBadge";

interface Props {
  listing: Listing;
}

export function ListingCard({ listing }: Props) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: listing.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{listing.foodName}</Text>
          <Text style={styles.distance}>{listing.distanceKm?.toFixed(2) ?? "0.00"} km</Text>
        </View>
        <Text style={styles.sub}>{listing.userType === "hotel" ? "Restaurant" : "Home"}</Text>
        <Text style={styles.sub}>{listing.quantity} · {listing.foodType}</Text>
        <FreshnessBadge prepTime={listing.prepTime} expiresAt={listing.expiresAt} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
    elevation: 2
  },
  image: {
    width: 96,
    height: 96
  },
  content: {
    flex: 1,
    padding: 12,
    gap: 6
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  name: {
    fontWeight: "700",
    fontSize: 16
  },
  distance: {
    color: "#1f7a1f",
    fontWeight: "600"
  },
  sub: {
    color: "#555"
  }
});
