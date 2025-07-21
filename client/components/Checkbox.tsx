import { Colors, FontSizes, Gaps } from "@/styles/theme";
import React, { useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";

type CheckboxProps = {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
};

export const Checkbox = ({
  label,
  checked: controlledChecked,
  onChange,
}: CheckboxProps) => {
  const [internalChecked, setInternalChecked] = useState(false);
  const checked =
    controlledChecked !== undefined ? controlledChecked : internalChecked;

  const handlePress = () => {
    if (onChange) {
      onChange(!checked);
    } else {
      setInternalChecked(!checked);
    }
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <View style={[styles.box, checked && styles.checkedBox]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Gaps.g4,
  },
  box: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: Colors.black,
    borderRadius: 4,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkedBox: {
    backgroundColor: Colors.primaryLimo,
    borderWidth: 1,
  },
  checkmark: { color: Colors.black, fontWeight: "bold" },
  label: {
    fontSize: FontSizes.TextLargeFs,
    color: Colors.black,
    alignSelf: "center",
  },
});
