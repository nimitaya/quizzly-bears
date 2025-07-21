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
  const { width, height } = useWindowDimensions();
  const cardWidth = Math.min((width - 64) / 2, 160); // Responsive card width with max size
  const cardHeight = Math.min(cardWidth, 160); // Square cards

  const handleGamePress = (gameName: string) => {
    console.log(`Starting ${gameName}`);
    if (gameName === "Connect Four") {
      router.push("/(tabs)/play/ConnectFourScreen");
    } else if (gameName === "Space Invaders") {
      router.push("/(tabs)/play/SpaceInvadersScreen");
    } else if (gameName === "Ping Pong") {
      router.push("/(tabs)/play/PingPongScreen");
    } else if (gameName === "Snake") {
      router.push("/(tabs)/play/SnakeScreen");
    }
    // Other games can be started here later
    // router.push(`/games/${gameName.toLowerCase()}`);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
      bounces={true}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        accessibilityLabel="Go back"
      >
        <IconArrowBack />
      </TouchableOpacity>
      <View style={{ marginBottom: Gaps.g24 }}>
        <Logo size="small" />
      </View>
      <Text style={styles.subtitle}>Mini Games</Text>
      <View style={styles.gamesGrid}>
        {/* Top row */}
        <View style={styles.row}>
          <GameCard
            title="Connect Four"
            imageSource={require("@/assets/images/VierGewinnt.webp")}
            onPress={() => handleGamePress("Connect Four")}
          />
          <View style={{ width: Gaps.g8 }} />
          <GameCard
            title="Space Invaders"
            imageSource={require("@/assets/images/SpaceInvaders.webp")}
            onPress={() => handleGamePress("Space Invaders")}
          />
        </View>

        {/* Bottom row */}
        <View style={styles.row}>
          <GameCard
            title="Ping Pong"
            imageSource={require("@/assets/images/Pingpong.webp")}
            onPress={() => handleGamePress("Ping Pong")}
          />
          <View style={{ width: Gaps.g8 }} />
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
    marginTop: Gaps.g80,
  },
  contentContainer: {
    alignItems: "center",
    flexGrow: 1,
    paddingBottom: Gaps.g40,
    paddingHorizontal: Gaps.g16,
  },
  backButton: {
    position: "absolute",
    top: -8,
    left: 16,
    zIndex: 10,
  },
  subtitle: {
    fontSize: FontSizes.H2Fs,
    textAlign: "center",
    paddingBottom: Gaps.g24,
    color: Colors.black,
  },
  gamesGrid: {
    width: "100%",
    paddingHorizontal: Gaps.g8,
    minHeight: 350,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: Gaps.g8,
  },
  gameCard: {
    backgroundColor: Colors.primaryLimo,
    borderRadius: Gaps.g16,
    padding: Gaps.g8,
    alignItems: "center",
    justifyContent: "center",
    width: 160,
    height: 160,
  },
  gameImage: {
    width: 80,
    height: 80,
    marginBottom: Gaps.g8,
    borderRadius: Gaps.g8,
  },
  gameTitle: {
    fontSize: FontSizes.TextMediumFs,
    color: Colors.black,
    textAlign: "center",
    fontWeight: FontWeights.SubtitleFw as any,
  },
  backButtonContainer: {
    marginTop: Gaps.g16,
    width: "100%",
    alignItems: "center",
  },
});

export default MiniGamesScreen;
