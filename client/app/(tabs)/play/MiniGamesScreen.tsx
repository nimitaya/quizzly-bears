import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
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
    } else if (gameName === "Space Invaders") {
      router.push("/(tabs)/play/SpaceInvadersScreen");
    }
    // Hier können später die anderen Spiele gestartet werden
    // router.push(`/games/${gameName.toLowerCase()}`);
  };

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
        <Logo size="small" />
      </View>
      <Text style={styles.subtitle}>Mini Games</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgGray,
    marginTop: Gaps.g80,
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: -8,
    left: 16,
    zIndex: 10,
  },
  header: {
    alignItems: "center",
    marginBottom: Gaps.g4,
  },
  subtitle: {
    fontSize: FontSizes.TextMediumFs,
    fontWeight: FontWeights.SubtitleFw as any,
    color: Colors.darkGreen,
    textAlign: "center",
    marginBottom: Gaps.g4,
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