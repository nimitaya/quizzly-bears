import {
  ButtonPrimary,
  ButtonPrimaryDisabled,
  ButtonSecondary,
  ButtonSkip,
  ButtonSmallPrimary,
  ButtonSmallSecondary,
} from "@/components/Buttons";
import { QuizButton } from "@/components/QuizButtons";
import { Text, View } from "react-native";

// This can be the Loading Screen at the beginning of the app

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
