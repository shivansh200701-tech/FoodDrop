import React, { useCallback, useEffect, useState } from "react";
import { Alert, Button, FlatList, StyleSheet, Text, View } from "react-native";
import { ListingCard } from "../components/ListingCard";
import { getMyListings, removeListing, setListingStatus } from "../services/listings";
import { Listing } from "../types/listing";

export function MyListingsScreen() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await getMyListings();
      setListings(data);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const markOutOfStock = async (listingId: string) => {
    await setListingStatus(listingId, "empty");
    await load();
  };

  const deleteListing = async (listingId: string) => {
    await removeListing(listingId);
    await load();
  };

  const onDelete = (listingId: string) =>
    Alert.alert("Delete listing", "Are you sure you want to delete this listing?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => void deleteListing(listingId) }
    ]);

  return (
    <FlatList
      style={styles.screen}
      data={listings}
      keyExtractor={(item) => item.listingId}
      refreshing={refreshing}
      onRefresh={() => void load()}
      ListEmptyComponent={<Text style={styles.empty}>No listings posted yet.</Text>}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <ListingCard listing={item} />
          <View style={styles.actions}>
            <Button title="Out of Stock" onPress={() => void markOutOfStock(item.listingId)} />
            <Button title="Delete" color="#a70000" onPress={() => onDelete(item.listingId)} />
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    padding: 12
  },
  item: {
    marginBottom: 14
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  empty: {
    textAlign: "center",
    marginTop: 36,
    color: "#777"
  }
});
