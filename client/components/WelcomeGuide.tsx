import { View, Text } from "react-native";
import { Colors } from "@/styles/theme";
import { ButtonPrimary } from "@/components/Buttons";
import { Logo } from "@/components/Logos";
import { FontSizes, Gaps } from "@/styles/theme";
import { StyleSheet } from "react-native";
import IconCheckbox from "@/assets/icons/IconCheckbox";

interface WelcomeGuideProps {
  onNext?: () => void;
  buttonText?: string;
  showButton?: boolean;
}

export default function WelcomeGuide({
  onNext,
  buttonText = "Next",
  showButton = true,
}: WelcomeGuideProps) {
  const handlePress = () => {
    console.log("WelcomeGuide: Button pressed");
    if (onNext) {
      onNext();
    } else {
      console.error("WelcomeGuide: onNext function is undefined");
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: Gaps.g16 }}>
        <Logo size="start" />
      </View>
      <View style={styles.descriptionContainer}>
        <View style={styles.TextBox}>
          <Text
            style={{
              color: Colors.black,
              fontSize: FontSizes.H1Fs,
              marginBottom: Gaps.g16,
              textAlign: "left",
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
      </View>

      {showButton && onNext && (
        <ButtonPrimary text={buttonText} onPress={handlePress} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Gaps.g40,
    alignItems: "center",
  },
  descriptionContainer: {
    marginBottom: Gaps.g24,
    alignItems: "center",
    width: "100%",
  },
  TextBox: {
    alignItems: "flex-start",
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
