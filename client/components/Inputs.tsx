import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  useWindowDimensions,
} from "react-native";
import { Colors, FontSizes } from "../styles/theme";
export default function Input(props: TextInputProps) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 348;

  return (
    <View
      style={[styles.container, isSmallScreen && { paddingHorizontal: 16 }]}
    >
      <TextInput
        style={styles.input}
        placeholderTextColor={Colors.disable}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 348,
    alignSelf: "center",
  },
  input: {
    height: 56,
    borderRadius: 50,
    backgroundColor: Colors.bgGray,
    color: Colors.black,
    borderStyle: "solid",
    borderWidth: 2,
    borderColor: Colors.primaryLimo,
    width: "100%",
    paddingHorizontal: 32,
    fontSize: FontSizes.TextLargeFs,
  },
});
