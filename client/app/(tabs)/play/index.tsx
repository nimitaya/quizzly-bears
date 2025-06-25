import { ButtonPrimary } from "@/components/Buttons";
import { Gaps } from "@/styles/theme";
import { Link } from "expo-router";
import { Text, View } from "react-native";
const PlayScreen = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: Gaps.g16,
      }}
    >
      <Text>Home Screen</Text>
      <ButtonPrimary text="Go Play" />
      <Text>Top 10 Players</Text>
    </View>
  );
};
export default PlayScreen;
