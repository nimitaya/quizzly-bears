import { Text, View, TouchableOpacity } from "react-native";
import IconArrowBack from "@/assets/icons/IconArrowBack";
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons";
import { Logo } from "@/components/Logos";
import { Colors, FontSizes, Gaps } from "@/styles/theme";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";

const QuizTypeSelectionScreen = () => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        accessibilityLabel="Go back"
      >
        <IconArrowBack />
      </TouchableOpacity>
      <View style={{ marginBottom: Gaps.g40 }}>
        <Logo size="big" />
      </View>
      <View style={styles.buttonContainer}>
        <ButtonPrimary
          text="Play alone"
          onPress={() => router.push("/(tabs)/play/QuizScreen")}
        />
        <ButtonPrimary
          text="Play a duel"
          onPress={() => router.push("/(tabs)/play/QuizScreen")}
        />
        <ButtonPrimary
          text="Play in group"
          onPress={() => router.push("/(tabs)/play/QuizScreen")}
        />
        <ButtonSecondary text="Mini games" />
      </View>
    </View>
  );
};
export default QuizTypeSelectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Gaps.g80,
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: -8,
    left: 16,
    zIndex: 10,
  },
  buttonContainer: {
    gap: Gaps.g32,
  },
});
