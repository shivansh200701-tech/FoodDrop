import React, { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useNearbyListings } from "../hooks/useNearbyListings";
import { ListingCard } from "../components/ListingCard";
import { Listing } from "../types/listing";

export function MapScreen() {
  const [radiusKm] = useState(5);
  const { listings, loading, error, center } = useNearbyListings(radiusKm);

  const region = useMemo(() => {
    if (!center) return undefined;
    return {
      latitude: center.lat,
      longitude: center.lng,
      latitudeDelta: 0.06,
      longitudeDelta: 0.06
    };
  }, [center]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading nearby food...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {region ? (
        <MapView style={styles.map} initialRegion={region}>
          {listings.map((listing) => (
            <Marker
              key={listing.listingId}
              coordinate={{ latitude: listing.location.lat, longitude: listing.location.lng }}
              title={listing.foodName}
              pinColor={listing.status === "available" ? "green" : "red"}
              description={listing.userType === "hotel" ? "Restaurant" : "Home"}
            />
          ))}
        </MapView>
      ) : null}

      <FlatList<Listing>
        data={listings}
        keyExtractor={(item) => item.listingId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <ListingCard listing={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f7" },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  map: {
    height: 240,
    width: "100%"
  },
  list: {
    padding: 12
  }
});
