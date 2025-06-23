import {
  ButtonPrimary,
  ButtonPrimaryDisabled,
  ButtonSecondary,
  ButtonSkip,
  ButtonSmallPrimary,
  ButtonSmallSecondary,
} from "@/components/Buttons";
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
      <ButtonPrimary text="Play alone" />
      <ButtonSecondary text="Play with friends" />
      <ButtonPrimaryDisabled text="Play with (disabled)" />
      <ButtonSkip text="Skip" />
      <ButtonSmallPrimary text="Yes" />
      <ButtonSmallSecondary text="No" />
    </View>
  );
}
