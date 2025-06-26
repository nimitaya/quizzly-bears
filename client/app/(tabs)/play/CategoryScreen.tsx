import { View, TouchableOpacity, Text, ScrollView } from "react-native";
import IconArrowBack from "@/assets/icons/IconArrowBack";
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons";
import { Logo } from "@/components/Logos";
import { FontSizes, Gaps } from "@/styles/theme";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { SearchInput } from "@/components/Inputs";
import { Checkbox } from "@/components/Checkbox";
import { RadioButton } from "@/components/RadioButton";
import { useState } from "react";

const LEVELS = [
  { label: "Easy: Cub Curious", value: "easy" },
  { label: "Medium: Bearly Brainy", value: "medium" },
  { label: "Hard: Grizzly Guru", value: "hard" },
];

const CategoryScreen = () => {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState("medium"); // по умолчанию medium

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
        <View style={{ marginBottom: Gaps.g40 }}>
          <Logo size="small" />
        </View>
        <View style={styles.levelSelectionBlock}>
          {LEVELS.map((level) => (
            <RadioButton
              key={level.value}
              label={level.label}
              selected={selectedLevel === level.value}
              onChange={() => setSelectedLevel(level.value)}
            />
          ))}
        </View>
        <View style={styles.searchToticBlock}>
          <SearchInput placeholder="your topic ..." />
          <ButtonPrimary text="Search" />
        </View>
        <View style={{ marginVertical: Gaps.g32 }}>
          <Text style={{ fontSize: FontSizes.H3Fs }}>
            or pick a prepared topic
          </Text>
        </View>
        <View style={styles.preparedToticContainer}>
          <ButtonSecondary
            text="history"
            onPress={() => router.push("/(tabs)/play/QuizScreen")}
          />
          <ButtonSecondary text="science" />
          <ButtonSecondary text="sport" />
          <ButtonSecondary text="geography" />
          <ButtonSecondary text="medien" />
          <ButtonSecondary text="culture" />
          <ButtonSecondary text="daily life" />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Gaps.g80,
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: -4,
    left: 16,
    zIndex: 10,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 32,
    paddingHorizontal: 0,
  },
  searchToticBlock: {
    gap: Gaps.g16,
  },
  levelSelectionBlock: {
    marginBottom: Gaps.g32,
  },
  preparedToticContainer: {
    gap: Gaps.g16,
  },
});

export default CategoryScreen;
