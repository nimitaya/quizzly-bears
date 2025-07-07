import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors, FontSizes, FontWeights, Gaps, Radius } from "@/styles/theme";
import IconArrowBack from "@/assets/icons/IconArrowBack";
import { Logo } from "@/components/Logos";
import { ButtonSecondary, ButtonPrimary } from "@/components/Buttons";

interface GameCardProps {
  title: string;
  imageSource: any;
  onPress: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ title, imageSource, onPress }) => {
  return (
    <TouchableOpacity style={styles.gameCard} onPress={onPress}>
      <Image source={imageSource} style={styles.gameImage} />
      <Text style={styles.gameTitle}>{title}</Text>
    </TouchableOpacity>
  );
};

const MiniGamesScreen = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const cardWidth = (width - 64) / 2; // 2 Karten pro Reihe mit Abständen

  const handleGamePress = (gameName: string) => {
    console.log(`Starting ${gameName}`);
    if (gameName === "Connect Four") {
      router.push("/(tabs)/play/ConnectFourScreen");
    }
    // Hier können später die anderen Spiele gestartet werden
    // router.push(`/games/${gameName.toLowerCase()}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        accessibilityLabel="Go back"
      >
        <IconArrowBack />
      </TouchableOpacity>

      <View style={styles.header}>
        <Logo size="big" />
        <Text style={styles.title}>Mini Games</Text>
      </View>

      <View style={styles.gamesGrid}>
        {/* Obere Reihe */}
        <View style={styles.row}>
          <GameCard
            title="Connect Four"
            imageSource={require("@/assets/images/VierGewinnt.webp")}
            onPress={() => handleGamePress("Connect Four")}
          />
          <View style={{ width: Gaps.g16 }} />
          <GameCard
            title="Space Invaders"
            imageSource={require("@/assets/images/SpaceInvaders.webp")}
            onPress={() => handleGamePress("Space Invaders")}
          />
        </View>

        {/* Untere Reihe */}
        <View style={styles.row}>
          <GameCard
            title="Ping Pong"
            imageSource={require("@/assets/images/Pingpong.webp")}
            onPress={() => handleGamePress("Ping Pong")}
          />
          <View style={{ width: Gaps.g16 }} />
          <GameCard
            title="Snake"
            imageSource={require("@/assets/images/snake.webp")}
            onPress={() => handleGamePress("Snake")}
          />
        </View>
      </View>

      <View style={styles.backButtonContainer}>
        <ButtonSecondary
          text="Back"
          onPress={() => router.push("/(tabs)/play/QuizTypeSelectionScreen")}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgGray,
  },
  contentContainer: {
    paddingHorizontal: Gaps.g16,
    paddingBottom: Gaps.g40,
    minHeight: '100%',
  },
  backButton: {
    position: "absolute",
    top: Gaps.g8,
    left: Gaps.g16,
    zIndex: 10,
  },
  header: {
    alignItems: "center",
    marginTop: Gaps.g40,
    marginBottom: -10,
  },
  title: {
    fontSize: FontSizes.H1Fs,
    fontWeight: FontWeights.H1Fw as any,
    color: Colors.black,
    marginTop: Gaps.g48,
  },
  gamesGrid: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Gaps.g16,
    minHeight: 400,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: Gaps.g16,
  },
  gameCard: {
    backgroundColor: Colors.primaryLimo,
    borderRadius: 16,
    padding: Gaps.g16,
    alignItems: "center",
    justifyContent: "center",
    width: 160,
    height: 160,
  },
  gameImage: {
    width: 80,
    height: 80,
    marginBottom: Gaps.g8,
    borderRadius: 8,
  },
  gameTitle: {
    fontSize: FontSizes.TextMediumFs,
    fontWeight: FontWeights.SubtitleFw as any,
    color: Colors.darkGreen,
    textAlign: "center",
  },
  backButtonContainer: {
    marginTop: Gaps.g4,
    marginBottom: Gaps.g40,
  },
});

export default MiniGamesScreen; 