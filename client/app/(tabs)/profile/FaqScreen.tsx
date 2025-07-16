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
import { useTranslation } from "@/hooks/useTranslation";
import { TranslationKeys } from "@/utilities/translations";

// FAQ data
const getFaqData = (t: (key: keyof TranslationKeys) => string) => [
  {
    id: 1,
    question: t("faqHowDoesGameWork"),
    answer: t("faqHowDoesGameWorkAnswer"),
  },
  {
    id: 2,
    question: t("faqGameModes"),
    answer: t("faqGameModesAnswer"),
  },
  {
    id: 3,
    question: t("faqTimingAndAnswering"),
    answer: t("faqTimingAndAnsweringAnswer"),
  },
  {
    id: 4,
    question: t("faqPoints"),
    answer: t("faqPointsAnswer"),
  },
  {
    id: 5,
    question: t("faqRewards"),
    answer: t("faqRewardsAnswer"),
  },
  {
    id: 6,
    question: t("faqStats"),
    answer: t("faqStatsAnswer"),
  },
  {
    id: 7,
    question: t("faqChallenges"),
    answer: t("faqChallengesAnswer"),
  },
  {
    id: 8,
    question: t("faqFriends"),
    answer: t("faqFriendsAnswer"),
  },
];

// FAQ Item Component
const FaqItem = ({ item }: { item: { id: number; question: string; answer: string } }) => {
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
  const { t } = useTranslation();
  const faqData = getFaqData(t);

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
        <Text style={styles.title}>{t("frequentlyAskedQuestions")}</Text>

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
