import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  useWindowDimensions,
} from "react-native";
import { Colors, FontSizes } from "../styles/theme";
import { ButtonSearchFriend } from "./Buttons";

// 1. Universal Search Input
export function SearchInput(props: TextInputProps) {
  const { width } = useWindowDimensions();
  const inputWidth = Math.min(348, width - 32);

  return (
    <View style={[styles.containerSearch, { width: inputWidth }]}>
      <TextInput
        style={styles.inputSearch}
        placeholderTextColor={Colors.disable}
        {...props}
      />
    </View>
  );
}

// 2. Input with search button

export function SearchFriendInput(props: TextInputProps) {
  return (
    <View style={styles.containerSearchFriend}>
      <TextInput
        style={styles.inputSearchFriend}
        placeholderTextColor={Colors.disable}
        {...props}
      />
      <View style={{ width: 8 }} />
      <ButtonSearchFriend />
    </View>
  );
}

const styles = StyleSheet.create({
  containerSearch: {
    width: "100%",
    maxWidth: 348,
    alignSelf: "center",
  },
  inputSearch: {
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
    textAlign: "center",
  },
  containerSearchFriend: {
    width: "100%",
    alignSelf: "center",
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 348,
  },
  inputSearchFriend: {
    height: 56,
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: Colors.bgGray,
    color: Colors.black,
    borderStyle: "solid",
    borderWidth: 2,
    borderColor: Colors.primaryLimo,
    flex: 1,
    paddingHorizontal: 32,

    fontSize: FontSizes.TextLargeFs,
  },
});
