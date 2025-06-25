import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons";
import { Gaps } from "@/styles/theme";
import { useRouter, router } from "expo-router";
import { Text, View } from "react-native";
const PlayScreen = () => {
  const router = useRouter();
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
      <ButtonSecondary
        text="Play beginner"
        onPress={() => router.push("/(tabs)/play/QuizScreen")}
      />
    </View>
  );
};
export default PlayScreen;
