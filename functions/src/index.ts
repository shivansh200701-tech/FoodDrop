import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { distanceBetween } from "geofire-common";

admin.initializeApp();
const db = admin.firestore();

export const expireOldListings = onSchedule("every 30 minutes", async () => {
  const now = admin.firestore.Timestamp.now();
  const snapshot = await db
    .collection("listings")
    .where("status", "==", "available")
    .where("expiresAt", "<=", now)
    .get();

  if (snapshot.empty) {
    logger.info("No listings to expire");
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { status: "expired" });
  });

  await batch.commit();
  logger.info(`Expired ${snapshot.size} listings`);
});

export const notifyNearbyUsers = onDocumentCreated("listings/{listingId}", async (event) => {
  const listing = event.data?.data();
  if (!listing || listing.status !== "available") return;

  const usersSnapshot = await db.collection("users").where("pushToken", "!=", null).get();
  const recipients = usersSnapshot.docs.filter((userDoc) => {
    const user = userDoc.data();
    if (!user.location || !listing.location) return false;

    const distanceKm = distanceBetween(
      [user.location.lat, user.location.lng],
      [listing.location.lat, listing.location.lng]
    );

    return distanceKm <= (user.radiusKm ?? 5);
  });

  if (!recipients.length) {
    logger.info("No nearby users to notify for listing", { listingId: event.params.listingId });
    return;
  }

  const tokens = recipients.map((doc) => doc.data().pushToken).filter(Boolean);
  if (!tokens.length) return;

  await admin.messaging().sendEachForMulticast({
    tokens,
    notification: {
      title: "New food nearby 🍱",
      body: `${listing.foodName} is available for pickup.`
    },
    data: {
      listingId: event.params.listingId,
      type: "new_listing"
    }
  });

  logger.info("Sent nearby notifications", {
    listingId: event.params.listingId,
    recipients: tokens.length
  });
});
