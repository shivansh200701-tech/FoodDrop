import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { getNearbyListings } from "../services/listings";
import { Listing } from "../types/listing";

export function useNearbyListings(radiusKm = 5) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== "granted") {
          setError("Location permission denied");
          return;
        }

        const current = await Location.getCurrentPositionAsync({});
        const nextCenter = { lat: current.coords.latitude, lng: current.coords.longitude };
        setCenter(nextCenter);

        const nearby = await getNearbyListings(nextCenter, radiusKm);
        setListings(nearby);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load nearby listings");
      } finally {
        setLoading(false);
      }
    })();
  }, [radiusKm]);

  return { listings, loading, error, center };
}
