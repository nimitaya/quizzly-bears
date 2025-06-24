import React, { useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { Colors, FontSizes } from "@/styles/theme";

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
    marginVertical: 5,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  outerCircle: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.black,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  innerCircle: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: Colors.primaryLimo,
    borderColor: Colors.black,
    borderWidth: 1,
  },
  label: { fontSize: FontSizes.TextLargeFs },
});
