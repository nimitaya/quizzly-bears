import { View, TouchableOpacity, Text, ScrollView } from "react-native";
import IconArrowBack from "@/assets/icons/IconArrowBack";
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons";
import { Logo } from "@/components/Logos";
import { FontSizes, Gaps } from "@/styles/theme";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { SearchInput } from "@/components/Inputs";
import { RadioButton } from "@/components/RadioButton";
import { useEffect, useState } from "react";
import IconMedal1Place from "@/assets/icons/IconMedal1Place";
const StatisticsScreen = () => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: Gaps.g40 }}>
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
        <View style={styles.CategoryPerformanceContainer}>
          <Text style={{ fontSize: FontSizes.TextLargeFs }}>
            Category performance
          </Text>
          <ButtonSecondary text="History" />
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
    marginVertical: Gaps.g40,
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
});
