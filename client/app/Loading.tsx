import { View, StyleSheet, Image } from "react-native";
import { Logo } from "@/components/Logos";
import { Gaps } from "@/styles/theme";

const Loading = () => {
  return (
    <View style={styles.container}>
      <Logo size="big" />
      <Image
        source={{
          uri: "https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gif",
        }}
        style={{ width: 100, height: 100, alignSelf: "center" }}
        accessibilityLabel="Loading animation"
      />
    </View>
  );
};
export default Loading;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Gaps.g40,
  },
});
