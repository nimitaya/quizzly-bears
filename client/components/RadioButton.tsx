import React, { useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { Colors, FontSizes, Gaps } from "@/styles/theme";

type RadioButtonProps = {
  label: string;
  selected?: boolean;
  onChange?: (selected: boolean) => void;
};

export const RadioButton = ({
  label,
  selected: controlledSelected,
  onChange,
}: RadioButtonProps) => {
  const [internalSelected, setInternalSelected] = useState(false);
  const selected =
    controlledSelected !== undefined ? controlledSelected : internalSelected;

  const handlePress = () => {
    if (onChange) {
      onChange(!selected);
    } else {
      setInternalSelected(!selected);
    }
  };

  return (
    <Pressable style={radioStyles.container} onPress={handlePress}>
      <View style={radioStyles.outerCircle}>
        {selected && <View style={radioStyles.innerCircle} />}
      </View>
      <Text style={radioStyles.label}>{label}</Text>
    </Pressable>
  );
};

const radioStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Gaps.g4,
  },
  outerCircle: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.black,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  innerCircle: {
    height: 11,
    width: 11,
    borderRadius: 6,
    backgroundColor: Colors.primaryLimo,
    borderColor: Colors.black,
    borderWidth: 1,
    alignSelf: "center",
  },
  label: {
    fontSize: FontSizes.TextLargeFs,
    color: Colors.black,
    alignSelf: "center",
  },
});
