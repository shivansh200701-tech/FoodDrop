import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { getFreshnessColor, getFreshnessLabel } from "../utils/freshness";

interface Props {
  prepTime: string;
  expiresAt: string;
}

export function FreshnessBadge({ prepTime, expiresAt }: Props) {
  const color = getFreshnessColor(prepTime, expiresAt);
  const label = getFreshnessLabel(prepTime);

  return (
    <View style={[styles.badge, styles[color]]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start"
  },
  green: { backgroundColor: "#ddf6df" },
  yellow: { backgroundColor: "#fff4d6" },
  red: { backgroundColor: "#ffd9d9" },
  text: { fontSize: 12, fontWeight: "600" }
});
