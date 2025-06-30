import { View, TouchableOpacity, Text, ScrollView } from "react-native";
import { ButtonSecondary } from "@/components/Buttons";
import { Logo } from "@/components/Logos";
import { FontSizes, Gaps } from "@/styles/theme";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import IconMedal1Place from "@/assets/icons/IconMedal1Place";
import CircularProgress from "@/components/CircularProgress";
const StatisticsScreen = () => {
  const router = useRouter();

  // Example data - replace with real data from your API/state
  const correctAnswers = 250;
  const totalAnswers = 300;
  const accuracyPercentage = (correctAnswers / totalAnswers) * 100;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: Gaps.g16 }}>
          <Logo size="small" />
        </View>
        <Text style={{ fontSize: FontSizes.H2Fs }}>My statistics</Text>
        <View style={styles.allPointsMedalenBlock}>
          <Text style={{ fontSize: FontSizes.TextLargeFs }}>
            Quizzly Points: (link)
          </Text>
          <Text style={{ fontSize: FontSizes.TextLargeFs }}>
            My rank: (link)/(link)
          </Text>
          <View style={styles.allMedalenBlock}>
            <View style={styles.MedalenBlock}>
              <IconMedal1Place />
              <Text style={{ fontSize: FontSizes.TextLargeFs }}>(link)</Text>
            </View>
            <View style={styles.MedalenBlock}>
              <IconMedal1Place />
              <Text style={{ fontSize: FontSizes.TextLargeFs }}>(link)</Text>
            </View>
            <View style={styles.MedalenBlock}>
              <IconMedal1Place />
              <Text style={{ fontSize: FontSizes.TextLargeFs }}>(link)</Text>
            </View>
          </View>
        </View>
        <View style={styles.accuracyBlock}>
          <Text style={{ fontSize: FontSizes.TextLargeFs }}>
            {correctAnswers}/{totalAnswers} correct answers
          </Text>
          <CircularProgress
            percentage={accuracyPercentage}
            size={150}
            strokeWidth={8}
            animated={true}
            duration={2000}
          />
        </View>

        <View style={styles.CategoryPerformanceContainer}>
          <Text style={{ fontSize: FontSizes.TextLargeFs }}>
            Category performance
          </Text>
          <ButtonSecondary
            text="FAQ"
            onPress={() => router.push("/(tabs)/statistics/FaqScreen")}
          />
          <ButtonSecondary text="Science" />
          <ButtonSecondary text="Sports" />
          <ButtonSecondary text="Geography" />
          <ButtonSecondary text="Media" />
          <ButtonSecondary text="Culture" />
          <ButtonSecondary text="Daily life" />
        </View>
      </ScrollView>
    </View>
  );
};
export default StatisticsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Gaps.g80,
    alignItems: "center",
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 32,
    paddingHorizontal: 0,
  },
  CategoryPerformanceContainer: {
    gap: Gaps.g16,
    alignItems: "center",
  },
  allPointsMedalenBlock: {
    marginTop: Gaps.g40,
    gap: Gaps.g16,
    alignItems: "center",
  },
  allMedalenBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gaps.g16,
  },
  MedalenBlock: {
    flexDirection: "row",
    gap: Gaps.g4,
    alignItems: "center",
  },
  accuracyBlock: {
    gap: Gaps.g16,
    alignItems: "center",
    marginVertical: Gaps.g40,
  },
});
