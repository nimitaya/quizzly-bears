import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Logo } from "@/components/Logos";
import React, { useEffect, useState } from "react";
import { FontSizes, Gaps } from "@/styles/theme";
import IconMedal1Place from "@/assets/icons/IconMedal1Place";
import CircularProgress from "@/components/CircularProgress";
import { CategoryProgressBar } from "@/components/CategoryProgressBar";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import axios from "axios";
import CustomAlert from "@/components/CustomAlert";
import Loading from "../../Loading";

const StatisticsScreen = () => {
  const API_BASE_URL =
    process.env.VITE_API_BASE_URL || "http://localhost:3000/api";

  const { user } = useUser();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/users/${user.id}`);
        setUserData(res.data);
      } catch (err) {
        console.error("Failed to load user data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (loading) {
    return (
      <>
        <Loading />
      </>
    );
  }

  if (!userData) {
    setShowForm(true);
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
            My rank: (link)/(link)
          </Text>
          <View style={styles.allMedalenBlock}>
            <View style={styles.MedalenBlock}>
              <IconMedal1Place />
              <Text style={{ fontSize: FontSizes.TextLargeFs }}>
                {medals.gold}
              </Text>
            </View>
            <View style={styles.MedalenBlock}>
              <IconMedal1Place />
              <Text style={{ fontSize: FontSizes.TextLargeFs }}>
                {medals.silver}
              </Text>
            </View>
            <View style={styles.MedalenBlock}>
              <IconMedal1Place />
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
          {/* <CategoryProgressBar
            text="History"
            progress={categoryPerformance.history}
          />
          <CategoryProgressBar
            text="Science"
            progress={categoryPerformance.science}
          />
          <CategoryProgressBar
            text="Sport"
            progress={categoryPerformance.sport}
          />
          <CategoryProgressBar
            text="Geography"
            progress={categoryPerformance.geography}
          />
          <CategoryProgressBar
            text="Medien"
            progress={categoryPerformance.medien}
          />
          <CategoryProgressBar
            text="Culture"
            progress={categoryPerformance.culture}
          />
          <CategoryProgressBar
            text="Daily life"
            progress={categoryPerformance.dailyLife}
          /> */}
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
    gap: Gaps.g16,
  },
  MedalenBlock: {
    flexDirection: "row",
    gap: Gaps.g4,
    alignItems: "center",
  },
  accuracyBlock: {
    gap: Gaps.g16,
    alignItems: "center",
    marginVertical: Gaps.g40,
  },
});
