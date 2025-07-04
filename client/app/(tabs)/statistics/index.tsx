import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Logo } from "@/components/Logos";
import React, { useEffect, useState } from "react";
import { FontSizes, Gaps } from "@/styles/theme";
import IconMedal1PlaceWebp from "@/assets/icons-webp/IconMedal1PlaceWebp";
import IconMedal2PlaceWebp from "@/assets/icons-webp/IconMedal2PlaceWebp";
import IconMedal3PlaceWebp from "@/assets/icons-webp/IconMedal3PlaceWebp";
import CircularProgress from "@/components/CircularProgress";
import { CategoryProgressBar } from "@/components/CategoryProgressBar";
import { useStatistics } from "@/providers/UserProvider";
import Loading from "../../Loading";
import CustomAlert from "@/components/CustomAlert";
import { useUser } from "@clerk/clerk-expo";
import ClerkSettings from "@/app/(auth)/ClerkSettings";

const StatisticsScreen = () => {
  const { userData, loading, userRank, totalUsers } = useStatistics();
  const [showForm, setShowForm] = useState(false);
  const { user } = useUser();

  if (!user) {
    return (
      <View style={styles.container}>
        <ClerkSettings refreshKey={0} />
        <Text style={{ fontSize: FontSizes.TextMediumFs, marginTop: Gaps.g16 }}>
          Please log in to see your statistics.
        </Text>
      </View>
    );
  }

  useEffect(() => {
    if (!userData && !loading) {
      setShowForm(true);
    }
  }, [userData, loading]);

  if (loading) return <Loading />;
  if (!userData && !loading) {
    return (
      <CustomAlert
        visible={showForm}
        onClose={() => setShowForm(false)}
        message="Such user isn't registered yet. Please try again later."
        cancelText={null}
        confirmText="OK"
        noInternet={false}
      />
    );
  }

  const {
    points,
    medals,
    categoryStats,
  }: {
    points: {
      correctAnswers: number;
      totalAnswers: number;
      totalPoints: number;
    };
    medals: { gold: number; silver: number; bronze: number };
    categoryStats: {
      categoryName: string;
      correctAnswers: number;
      totalAnswers: number;
    }[];
  } = userData;

  const accuracy =
    points.totalAnswers === 0
      ? 0
      : (points.correctAnswers / points.totalAnswers) * 100;

  const categoryPerformance = categoryStats.reduce((acc, cat) => {
    const percent =
      cat.totalAnswers === 0
        ? 0
        : Math.round((cat.correctAnswers / cat.totalAnswers) * 100);
    acc[cat.categoryName] = percent;
    return acc;
  }, {} as Record<string, number>);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: Gaps.g16 }}>
          <Logo size="small" />
        </View>
        <Text style={{ fontSize: FontSizes.H2Fs }}>My statistics</Text>
        <View style={styles.allPointsMedalenBlock}>
          <Text style={{ fontSize: FontSizes.TextLargeFs }}>
            Quizzly Points: {points.totalPoints}
          </Text>
          <Text style={{ fontSize: FontSizes.TextLargeFs }}>
            My rank: {userRank ?? "-"}/{totalUsers ?? "-"}
          </Text>
          <View style={styles.allMedalenBlock}>
            <View style={styles.MedalenBlock}>
              <IconMedal1PlaceWebp />
              <Text style={{ fontSize: FontSizes.TextLargeFs }}>
                {medals.gold}
              </Text>
            </View>
            <View style={styles.MedalenBlock}>
              <IconMedal2PlaceWebp />
              <Text style={{ fontSize: FontSizes.TextLargeFs }}>
                {medals.silver}
              </Text>
            </View>
            <View style={styles.MedalenBlock}>
              <IconMedal3PlaceWebp />
              <Text style={{ fontSize: FontSizes.TextLargeFs }}>
                {medals.bronze}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.accuracyBlock}>
          <Text style={{ fontSize: FontSizes.TextLargeFs }}>
            {points.correctAnswers}/{points.totalAnswers} correct answers
          </Text>
          <CircularProgress
            percentage={accuracy}
            size={150}
            strokeWidth={8}
            animated={true}
            duration={2000}
          />
        </View>

        <View style={styles.CategoryPerformanceContainer}>
          <Text style={{ fontSize: FontSizes.TextLargeFs }}>
            Category performance
          </Text>
          {Object.entries(categoryPerformance).map(([name, progress]) => (
            <CategoryProgressBar key={name} text={name} progress={progress} />
          ))}
        </View>
      </ScrollView>
      <CustomAlert
        visible={showForm}
        onClose={() => setShowForm(false)}
        message="Such user isn't registered yet. Please try again later."
        cancelText={null}
        confirmText="OK"
        noInternet={false}
      />
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
    marginTop: Gaps.g40,
    gap: Gaps.g16,
    alignItems: "center",
  },
  allMedalenBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gaps.g24,
  },
  MedalenBlock: {
    flexDirection: "row",
    gap: Gaps.g8,
    alignItems: "center",
  },
  accuracyBlock: {
    gap: Gaps.g16,
    alignItems: "center",
    marginVertical: Gaps.g40,
  },
});
