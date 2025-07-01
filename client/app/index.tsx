import { View, Text } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { Colors } from "@/styles/theme";
import { ButtonPrimary } from "@/components/Buttons";
import { Logo } from "@/components/Logos";
import { FontSizes, Gaps } from "@/styles/theme";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import IconCheckbox from "@/assets/icons/IconCheckbox";
import { Redirect } from "expo-router";

export default function WelcomeScreen() {
  const router = useRouter();

  const { isSignedIn } = useUser();
  const IndexNavigation = () => {
    if (isSignedIn) {
      router.replace("/(tabs)/play");
    } else {
      router.replace("/(auth)/LogInScreen");
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: Gaps.g16 }}>
        <Logo size="start" />
      </View>
      <View style={styles.descriptionContainer}>
        <Text
          style={{
            color: Colors.black,
            fontSize: FontSizes.H1Fs,
            marginBottom: Gaps.g16,
          }}
        >
          Quizzly Bears Guide
        </Text>
        <View>
          <View style={styles.IconRow}>
            <IconCheckbox />
            <View>
              <Text style={styles.pointsText}>AI-Generated</Text>
              <Text style={styles.pointsTextTwo}>
                Get unique quizzes created by AI
              </Text>
            </View>
          </View>
          <View style={styles.IconRow}>
            <IconCheckbox />
            <View>
              <Text style={styles.pointsText}>Custom Topics</Text>
              <Text style={styles.pointsTextTwo}>
                Choose from our topics or enter your own (any language)
              </Text>
            </View>
          </View>
          <View style={styles.IconRow}>
            <IconCheckbox />
            <View>
              <Text style={styles.pointsText}>Play Your Way</Text>
              <Text style={styles.pointsTextTwo}>Solo or with friends</Text>
            </View>
          </View>
          <View style={styles.IconRow}>
            <IconCheckbox />
            <View>
              <Text style={styles.pointsText}>Compete & Win</Text>
              <Text style={styles.pointsTextTwo}>
                Score points, connect with friends, and become the weekly best
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ButtonPrimary text="Next" onPress={IndexNavigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Gaps.g80,
    alignItems: "center",
  },
  descriptionContainer: {
    marginBottom: Gaps.g24,
    alignSelf: "flex-start",
    marginLeft: Gaps.g32,
  },

  IconRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Gaps.g8,
    marginVertical: Gaps.g8,
  },
  pointsText: {
    fontSize: FontSizes.TextLargeFs,
  },
  pointsTextTwo: {
    fontSize: FontSizes.TextMediumFs,
    maxWidth: 280,
    flexShrink: 1,
  },
});

export function Index() {
  return <Redirect href="/(tabs)/play" />;
}
