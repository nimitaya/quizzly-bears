import {
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors, Radius } from "../styles/theme";

export function ButtonPrimary({
  text,
  ...props
}: PressableProps & { text: string }) {
  return (
    <Pressable {...props}>
      <View style={styles.buttonPrimary}>
        <Text style={styles.text}>{text}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonPrimary: {
    backgroundColor: Colors.primaryLimo,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    width: "100%",
    maxWidth: 348,
    height: 56,
    alignSelf: "center",
    borderRadius: Radius.r50,
  },
  text: {
    fontSize: 16,
    color: Colors.black,
  },
});
