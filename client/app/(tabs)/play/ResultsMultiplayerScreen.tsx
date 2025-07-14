import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons";
import { Logo } from "@/components/Logos";
import { Colors, FontSizes, Gaps, Radius } from "@/styles/theme";
import IconBear from "@/assets/icons/IconBearTabAktiv";

//====!!!!!!!!!!replace with real interface!!!!!!!!!!!!==========
interface PlayerResult {
  id: string;
  name: string;
  correctAnswers: number;
  totalQuestions: number;
  grizzlyPoints: number;
  extraPoints: number;
  totalPoints: number;
  isWinner?: boolean;
}

const ResultsMultiplayerScreen = () => {
  //====!!!!!!!!!!replace with real results!!!!!!!!!!!!==========
  const mockResults: PlayerResult[] = [
    {
      id: "1",
      name: "DarkMatterX",
      correctAnswers: 8,
      totalQuestions: 10,
      grizzlyPoints: 20,
      extraPoints: 15,
      totalPoints: 35,
      isWinner: false,
    },
    {
      id: "2",
      name: "CrimsonEcho",
      correctAnswers: 9,
      totalQuestions: 10,
      grizzlyPoints: 28,
      extraPoints: 10,
      totalPoints: 38,
      isWinner: true,
    },
  ];

  const winner = mockResults.find((player) => player.isWinner);
  //====!!!!!!!!!!replace with a real counter!!!!!!!!!!!==========
  const currentRound = 1;

  const handleNextRound = () => {
    // TODO: Navigate to next round
    console.log("Next round pressed");
  };

  const handleQuit = () => {
    // TODO: Handle quit functionality
    console.log("Quit pressed");
  };

  const renderPlayerResult = (player: PlayerResult, index: number) => (
    <View key={player.id} style={styles.playerContainer}>
      <View style={styles.playerHeader}>
        <Text style={styles.playerName}>{player.name}</Text>
        {player.isWinner && (
          <View style={styles.bearIconContainer}>
            <IconBear />
          </View>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Correct answers</Text>
          <Text style={styles.statValue}>
            {player.correctAnswers}/{player.totalQuestions}
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Grizzly punkte</Text>
          <Text style={styles.statValue}>{player.grizzlyPoints}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Extra punkte</Text>
          <Text style={styles.statValue}>{player.extraPoints}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalValue}>{player.totalPoints}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Logo size="small" />
        </View>

        {/* Winner announcement */}
        <Text style={styles.winnerTitle}>Cool! {winner?.name} win</Text>

        {/* Round info */}
        <Text style={styles.roundText}>Round {currentRound}</Text>

        {/* Results list */}
        <View style={styles.resultsContainer}>
          {mockResults.map((player, index) =>
            renderPlayerResult(player, index)
          )}
        </View>
      </ScrollView>

      {/* Action buttons */}
      <View style={styles.buttonContainer}>
        <ButtonPrimary text="Next round" onPress={handleNextRound} />

        <ButtonSecondary text="Quit" onPress={handleQuit} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Gaps.g80,
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: Gaps.g16,
  },
  logoContainer: {
    marginBottom: Gaps.g32,
  },
  winnerTitle: {
    fontSize: FontSizes.H1Fs,
    textAlign: "left",
    marginBottom: Gaps.g24,
  },
  roundText: {
    fontSize: FontSizes.TextLargeFs,
    marginBottom: Gaps.g32,
  },
  resultsContainer: {
    width: "100%",
    gap: Gaps.g24,
  },
  playerContainer: {
    paddingHorizontal: Gaps.g16,
    paddingVertical: Gaps.g4,
  },
  playerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Gaps.g16,
  },
  playerName: {
    fontSize: FontSizes.TextLargeFs,
  },
  bearIconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    gap: Gaps.g8,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    fontSize: FontSizes.TextMediumFs,
    color: Colors.black,
  },
  statValue: {
    fontSize: FontSizes.TextMediumFs,
  },
  divider: {
    height: 1,
    marginVertical: Gaps.g8,
  },
  totalRow: {
    alignItems: "flex-end",
  },
  totalValue: {
    fontSize: FontSizes.H3Fs,
    fontWeight: "bold",
  },
  buttonContainer: {
    width: "100%",
    gap: Gaps.g16,
    paddingVertical: Gaps.g16,
    alignItems: "center",
  },
});

export default ResultsMultiplayerScreen;
