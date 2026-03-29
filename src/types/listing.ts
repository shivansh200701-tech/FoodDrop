export type UserType = "home" | "hotel";
export type FoodType = "veg" | "non-veg" | "cooked" | "raw";
export type ListingStatus = "available" | "empty" | "expired";

export interface ListingLocation {
  lat: number;
  lng: number;
  geohash: string;
}

export interface PickupWindow {
  startAt: string;
  endAt: string;
}

export interface Listing {
  listingId: string;
  userId: string;
  userType: UserType;
  foodName: string;
  foodType: FoodType;
  prepTime: string;
  quantity: string;
  imageUrl: string;
  status: ListingStatus;
  location: ListingLocation;
  expiresAt: string;
  pickupWindow: PickupWindow;
  distanceKm?: number;
  createdAt?: string;
}
