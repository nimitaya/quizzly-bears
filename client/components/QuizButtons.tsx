import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { Colors, Radius, FontSizes } from "../styles/theme";

type QuizButtonProps = {
  text: string;
  selected: boolean;
  checked: boolean;
  isCorrect: boolean;
  onPress: () => void;
};

export function QuizButton({
  text,
  selected,
  checked,
  isCorrect,
  onPress,
}: QuizButtonProps) {
  const { width } = useWindowDimensions();
  const buttonWidth = Math.min(348, width - 32);

  // Determine border style after checking the answer
  let borderColor = Colors.darkGreen;
  let borderWidth = 1;
  if (checked) {
    borderColor = isCorrect ? Colors.primaryLimo : Colors.systemRed;
    borderWidth = 8;
  }

  return (
    <Pressable onPress={onPress} disabled={checked}>
      <View
        style={[
          styles.button,
          {
            width: buttonWidth,
            backgroundColor: selected ? Colors.disable : "transparent",
            borderColor,
            borderWidth,
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            { color: selected ? Colors.black : Colors.darkGreen },
          ]}
        >
          {text}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
    height: 56,
    alignSelf: "center",
    borderRadius: Radius.r50,
    marginVertical: 8,
    borderStyle: "solid",
  },
  text: {
    fontSize: FontSizes.TextLargeFs,
  },
});
