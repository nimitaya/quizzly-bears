import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLanguage } from "@/providers/LanguageContext";
import { getLocalizedText } from "@/utilities/languageUtils";

interface QuestionDisplayProps {
  question: any;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ question }) => {
  const { currentLanguage } = useLanguage();

  const questionText = getLocalizedText(
    question.question,
    currentLanguage.code
  );
  const optionAText = getLocalizedText(question.optionA, currentLanguage.code);
  const optionBText = getLocalizedText(question.optionB, currentLanguage.code);
  const optionCText = getLocalizedText(question.optionC, currentLanguage.code);
  const optionDText = getLocalizedText(question.optionD, currentLanguage.code);

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>{questionText}</Text>
      <View style={styles.optionsContainer}>
        <Text style={styles.optionText}>A) {optionAText}</Text>
        <Text style={styles.optionText}>B) {optionBText}</Text>
        <Text style={styles.optionText}>C) {optionCText}</Text>
        <Text style={styles.optionText}>D) {optionDText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 8,
  },
  optionText: {
    fontSize: 16,
    padding: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
});

export default QuestionDisplay;
