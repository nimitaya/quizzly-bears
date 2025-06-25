import { Colors, FontSizes } from "@/styles/theme";
import React, { useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";

type ToggleProps = {
  label: string;
};

export const Toggle = ({ label }: ToggleProps) => {
  const [enabled, setEnabled] = useState(false);

  return (
    <Pressable style={styles.container} onPress={() => setEnabled(!enabled)}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.toggleTrack, enabled && styles.toggleTrackEnabled]}>
        <View
          style={[styles.toggleThumb, enabled && styles.toggleThumbEnabled]}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 32,
  },
  toggleTrack: {
    width: 56,
    height: 32,
    borderRadius: 100,
    backgroundColor: Colors.disablelLimo,
    borderWidth: 2,
    borderColor: Colors.disable,
    justifyContent: "center",
    paddingHorizontal: 2,
    paddingVertical: 8,
  },
  toggleTrackEnabled: {
    backgroundColor: Colors.primaryLimo,
    borderColor: Colors.primaryLimo,
  },
  toggleThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.disable,
    elevation: 2,
    left: 4,
    position: "absolute",
  },
  toggleThumbEnabled: {
    left: 26,
    width: 22,
    height: 22,
    borderRadius: 12,
    backgroundColor: Colors.white,
  },
  label: { fontSize: FontSizes.TextLargeFs, color: Colors.black },
});
