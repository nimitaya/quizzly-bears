import { Colors, FontSizes } from "@/styles/theme";
import React, { useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";

type CheckboxProps = {
  label: string;
};

export const Checkbox = ({ label }: CheckboxProps) => {
  const [checked, setChecked] = useState(false);

  return (
    <Pressable style={styles.container} onPress={() => setChecked(!checked)}>
      <View style={[styles.box, checked && styles.checkedBox]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center" },
  box: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Colors.black,
    borderRadius: 4,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkedBox: {
    backgroundColor: Colors.primaryLimo,
    borderColor: Colors.primaryLimo,
  },
  checkmark: { color: Colors.black, fontWeight: "bold" },
  label: { fontSize: FontSizes.TextLargeFs, color: Colors.black },
});
