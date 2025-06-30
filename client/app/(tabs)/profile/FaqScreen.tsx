import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  ScrollView,
  Animated,
} from "react-native";
import IconArrowBack from "@/assets/icons/IconArrowBack";
import { Logo } from "@/components/Logos";
import { FontSizes, Gaps, Colors } from "@/styles/theme";
import { useRouter } from "expo-router";
import { useState, useRef } from "react";

// FAQ data
const faqData = [
  {
    id: 1,
    question: "How does the game work?",
    answer:
      "Each game round consists of 10 questions, with 30 seconds to answer each. The total round lasts about 5 minutes, plus a short time to read each question before the timer starts.",
  },
  {
    id: 2,
    question: "What game modes are available?",
    answer:
      "We offer three types of games:\n• Solo Mode - Play on your own, continue as soon as you answer.\n• Duel (1 vs 1) - Play against another user in 4 rounds of 10 questions each.\n• Group Mode - Each player plays one 10-question round. Up to 7-8 participants.",
  },
  {
    id: 3,
    question: "How does timing and answering work?",
    answer:
      "First, the question is shown with a few seconds to read. Then, the answer options appear. Only after that does the 30-second timer start. In solo mode, you continue immediately after answering. In multiplayer modes, everyone answers at the same time (synchronous play). During waiting times, you'll see a cute bear loading animation.",
  },
  {
    id: 4,
    question: "How are points awarded?",
    answer:
      "You earn points based on the difficulty of the question and how fast you answer:\n\nCorrect Answers:\n• Easy: 5 QP\n• Medium: 10 QP\n• Hard: 15 QP\n\nTime Bonus:\n• Answer under 5 sec: +5 QP\n• Answer under 10 sec: +3 QP\n• Answer under 20 sec: +1 QP\n\nPerfect Round Bonus:\n• All 10 questions correct: +50 QP",
  },
  {
    id: 5,
    question: "Are there any rewards?",
    answer:
      "Yes! We reward performance:\n\nTop 3 of the week: Receive medals (bronze, silver, gold) shown on your profile. Each comes with a Quizzly Bear trophy!\n\nTop accuracy (e.g. top 10% or 20%): Get a paw icon Medalen next to your username. Displayed in all games and rankings. Paw disappears if you fall below the threshold in the next week.",
  },
  {
    id: 6,
    question: "Can I track my stats?",
    answer:
      "Yes! Your profile shows:\n• Total points\n• Accuracy\n• Weekly rankings\n• Medals and rewards\n\nAlways up to date!",
  },
  {
    id: 7,
    question: "Are there any special challenges?",
    answer:
      "Top 10 players of the week might unlock an extra-hard quiz as a personal challenge! This is an optional feature we're currently testing.",
  },
  {
    id: 8,
    question: "How can I add friends?",
    answer:
      "• Search for friends by username or email address.\n• Send a friend request - the other user must accept.\n• If your friend doesn't have the app yet, you can send an invitation via email.",
  },
];

// FAQ Item Component
const FaqItem = ({ item }: { item: (typeof faqData)[0] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;

    Animated.parallel([
      Animated.timing(animatedHeight, {
        toValue: toValue,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(rotateAnim, {
        toValue: toValue,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setIsExpanded(!isExpanded);
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View style={styles.faqItem}>
      <TouchableOpacity
        style={styles.questionContainer}
        onPress={toggleExpanded}
        activeOpacity={1} // No flash effect
      >
        <Text style={styles.questionText}>{item.question}</Text>
        <Animated.View
          style={[
            styles.arrowContainer,
            { transform: [{ rotate: rotateInterpolate }] },
          ]}
        >
          <Text style={styles.arrow}>▼</Text>
        </Animated.View>
      </TouchableOpacity>
      <Animated.View
        style={[
          styles.answerContainer,
          {
            maxHeight: animatedHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1000],
            }),
            opacity: animatedHeight,
          },
        ]}
      >
        <Text style={styles.answerText}>{item.answer}</Text>
      </Animated.View>
    </View>
  );
};

const FaqScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        accessibilityLabel="Go back"
      >
        <IconArrowBack />
      </TouchableOpacity>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: Gaps.g16 }}>
          <Logo size="small" />
        </View>
        <Text style={styles.title}>FAQ</Text>

        <View style={styles.faqList}>
          {faqData.map((item) => (
            <FaqItem key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
export default FaqScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Gaps.g80,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: Gaps.g24,
  },
  backButton: {
    position: "absolute",
    top: -8,
    left: 16,
    zIndex: 10,
  },
  title: {
    fontSize: FontSizes.H3Fs,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: Gaps.g24,
  },
  faqList: {
    width: "100%",
    paddingHorizontal: Gaps.g16,
  },
  faqItem: {
    backgroundColor: Colors.white,
    borderRadius: Gaps.g16,
    marginBottom: Gaps.g16,
  },
  questionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Gaps.g16,
  },
  questionText: {
    flex: 1,
    fontSize: FontSizes.TextMediumFs,
    color: Colors.black,
    marginRight: Gaps.g8,
  },
  arrowContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  arrow: {
    fontSize: 16,
    color: Colors.primaryLimo,
    fontWeight: "bold",
  },
  answerContainer: {
    overflow: "hidden",
    paddingHorizontal: Gaps.g16,
  },
  answerText: {
    fontSize: FontSizes.TextSmallFs,
    color: Colors.black,
    lineHeight: 20,
    paddingBottom: Gaps.g16,
  },
});
