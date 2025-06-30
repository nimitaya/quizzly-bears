import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons";
import { Logo } from "@/components/Logos";
import { Colors, FontSizes, Gaps } from "@/styles/theme";
import { useRouter } from "expo-router";
import { Text, View, ScrollView } from "react-native";
import { StyleSheet } from "react-native";

const PlayScreen = () => {
  const router = useRouter();
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={{ marginBottom: Gaps.g40 }}>
          <Logo size="big" />
        </View>
        <View style={{ marginBottom: Gaps.g32 }}>
          <ButtonPrimary
            text="Go Play"
            onPress={() => router.push("/(tabs)/play/QuizTypeSelectionScreen")}
          />
        </View>
        <View style={styles.myRankBlock}>
          <Text style={{ fontSize: FontSizes.H2Fs }}>My Rank: 20 from 115</Text>
        </View>
        <View style={styles.topPlayersBlock}>
          <Text style={{ fontSize: FontSizes.H2Fs }}>Top 10 Players</Text>

          {/* ============ List of top players ============= */}
          <View style={styles.listTopPlayers}>
            <View>
              <Text style={{ fontSize: FontSizes.TextLargeFs }}>
                1. Player dfjhjadhsff
              </Text>
              <Text style={{ fontSize: FontSizes.TextLargeFs }}>
                2. Player dfjhjadhsff
              </Text>
              <Text style={{ fontSize: FontSizes.TextLargeFs }}>
                3. Player dfjhjadhsff
              </Text>
              <Text style={{ fontSize: FontSizes.TextLargeFs }}>
                4. Player dfjhjadhsff
              </Text>
              <Text style={{ fontSize: FontSizes.TextLargeFs }}>
                5. Player dfjhjadhsf
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: FontSizes.TextLargeFs }}>
                6. Playerdgsdfg
              </Text>
              <Text style={{ fontSize: FontSizes.TextLargeFs }}>
                7. Playerdgsdfg
              </Text>
              <Text style={{ fontSize: FontSizes.TextLargeFs }}>
                8. Playerdgsdfg
              </Text>
              <Text style={{ fontSize: FontSizes.TextLargeFs }}>
                9. Playerdgsdfg
              </Text>
              <Text style={{ fontSize: FontSizes.TextLargeFs }}>
                10. Playerdgsdfg
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};
export default PlayScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  container: {
    flex: 1,
    marginTop: Gaps.g80,
    alignItems: "center",
  },
  myRankBlock: {
    color: Colors.black,
    marginVertical: Gaps.g32,
  },
  topPlayersBlock: {
    alignItems: "center",
    width: "100%",
  },
  listTopPlayers: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Gaps.g32,
    marginTop: Gaps.g16,
  },
});
