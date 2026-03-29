import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where
} from "firebase/firestore";
import { geohashForLocation, geohashQueryBounds, distanceBetween } from "geofire-common";
import { auth, db } from "../config/firebase";
import { Listing, ListingStatus } from "../types/listing";

const LISTINGS = "listings";

export interface CreateListingInput {
  userType: Listing["userType"];
  foodName: string;
  foodType: Listing["foodType"];
  prepTime: string;
  quantity: string;
  imageUrl: string;
  location: { lat: number; lng: number };
  pickupWindow: { startAt: string; endAt: string };
}

export async function createListing(input: CreateListingInput): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Authentication required to post listings");

  const prepDate = new Date(input.prepTime);
  const expiresAt = new Date(prepDate.getTime() + 12 * 60 * 60 * 1000);

  await addDoc(collection(db, LISTINGS), {
    listingId: "",
    userId: currentUser.uid,
    userType: input.userType,
    foodName: input.foodName,
    foodType: input.foodType,
    prepTime: Timestamp.fromDate(prepDate),
    quantity: input.quantity,
    imageUrl: input.imageUrl,
    status: "available",
    location: {
      lat: input.location.lat,
      lng: input.location.lng,
      geohash: geohashForLocation([input.location.lat, input.location.lng])
    },
    pickupWindow: input.pickupWindow,
    expiresAt: Timestamp.fromDate(expiresAt),
    createdAt: Timestamp.now()
  });
}

export async function getNearbyListings(center: { lat: number; lng: number }, radiusKm = 5): Promise<Listing[]> {
  const bounds = geohashQueryBounds([center.lat, center.lng], radiusKm * 1000);
  const docs = await Promise.all(
    bounds.map(([start, end]) =>
      getDocs(
        query(
          collection(db, LISTINGS),
          orderBy("location.geohash"),
          where("location.geohash", ">=", start),
          where("location.geohash", "<=", end),
          where("status", "==", "available")
        )
      )
    )
  );

  const now = Date.now();
  const merged = docs
    .flatMap((snap) => snap.docs)
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((raw) => {
      const distKm = distanceBetween([center.lat, center.lng], [raw.location.lat, raw.location.lng]);
      return distKm <= radiusKm && raw.expiresAt.toMillis() > now;
    })
    .map((raw) => {
      const distKm = distanceBetween([center.lat, center.lng], [raw.location.lat, raw.location.lng]);
      return {
        ...raw,
        listingId: raw.id,
        prepTime: raw.prepTime.toDate().toISOString(),
        expiresAt: raw.expiresAt.toDate().toISOString(),
        createdAt: raw.createdAt?.toDate?.().toISOString(),
        distanceKm: distKm
      } as Listing;
    })
    .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0) || Date.parse(b.prepTime) - Date.parse(a.prepTime));

  return Array.from(new Map(merged.map((item) => [item.listingId, item])).values());
}

export async function setListingStatus(listingId: string, status: ListingStatus): Promise<void> {
  await updateDoc(doc(db, LISTINGS, listingId), { status });
}

export async function removeListing(listingId: string): Promise<void> {
  await deleteDoc(doc(db, LISTINGS, listingId));
}

export async function getMyListings(): Promise<Listing[]> {
  const currentUser = auth.currentUser;
  if (!currentUser) return [];

  const snap = await getDocs(query(collection(db, LISTINGS), where("userId", "==", currentUser.uid)));
  return snap.docs.map((d) => {
    const raw = d.data();
    return {
      ...raw,
      listingId: d.id,
      prepTime: raw.prepTime.toDate().toISOString(),
      expiresAt: raw.expiresAt.toDate().toISOString(),
      createdAt: raw.createdAt?.toDate?.().toISOString()
    } as Listing;
  });
}
