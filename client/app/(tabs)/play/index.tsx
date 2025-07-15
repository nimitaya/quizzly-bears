import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons";
import { Logo } from "@/components/Logos";
import { Colors, FontSizes, Gaps } from "@/styles/theme";
import { useRouter } from "expo-router";
import { Text, View, ScrollView } from "react-native";
import { StyleSheet } from "react-native";
import { useStatistics } from "@/providers/UserProvider";
import React, { useEffect, useState } from "react";
import Loading from "../../Loading";
import CustomAlert from "@/components/CustomAlert";
import { useUser } from "@clerk/clerk-expo";
// import { useFocusEffect } from "@react-navigation/native";
import { io } from "socket.io-client";

const PlayScreen = () => {
  const { topPlayers, loading, totalUsers, userRank, refetch } =
    useStatistics();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const { user } = useUser();
  const socket = io(process.env.EXPO_PUBLIC_SOCKET_URL);

  useEffect(() => {
    socket.on("pointsUpdated", () => {
      console.log("🔁 pointsUpdated received - outside");
      refetch &&
        refetch.forEach((fn) => {
          console.log("🔁 pointsUpdated received - inside");
          fn();
        });
    });

    return () => {
      socket.off("pointsUpdated");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (topPlayers.length === 0 && !loading) {
      setShowForm(true);
    }
  }, [topPlayers, loading]);

  if (loading) return <Loading />;
  if (topPlayers.length === 0 && !loading) {
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

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <View style={{ marginBottom: Gaps.g40 }}>
          <Logo size="big" />
        </View>
        <View style={{ marginBottom: Gaps.g24 }}>
          <ButtonPrimary
            text="Go Play"
            onPress={() => router.push("/(tabs)/play/QuizTypeSelectionScreen")}
          />
        </View>
        <View style={styles.myRankBlock}>
          <Text style={{ fontSize: FontSizes.H2Fs }}>
            My Rank: {user ? userRank ?? "-" : "-"} from {totalUsers ?? "-"}
          </Text>
        </View>
        <View style={styles.topPlayersBlock}>
          <Text style={{ fontSize: FontSizes.H2Fs }}>Top 10 Players</Text>

          {/* ============ List of top players ============= */}
          <View style={styles.listTopPlayers}>
            <View style={{ gap: Gaps.g4 }}>
              {topPlayers.slice(0, 5).map((player, idx) => {
                const emailName = player.email
                  ? player.email.split("@")[0].slice(0, 10)
                  : "";
                return (
                  <Text key={idx} style={{ fontSize: FontSizes.TextLargeFs }}>
                    {idx + 1}. {emailName} - {player.totalPoints}
                  </Text>
                );
              })}
            </View>
            <View style={{ gap: Gaps.g4 }}>
              {topPlayers.slice(5, 10).map((player, idx) => {
                const emailName = player.email
                  ? player.email.split("@")[0].slice(0, 10)
                  : "";
                return (
                  <Text
                    key={idx + 5}
                    style={{ fontSize: FontSizes.TextLargeFs }}
                  >
                    {idx + 6}. {emailName} - {player.totalPoints}
                  </Text>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};
export default PlayScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  container: {
    flex: 1,
    marginTop: Gaps.g80,
    alignItems: "center",
  },
  myRankBlock: {
    color: Colors.black,
    marginVertical: Gaps.g24,
  },
  topPlayersBlock: {
    marginTop: Gaps.g16,
    alignItems: "center",
    width: "100%",
  },
  listTopPlayers: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Gaps.g32,
    marginTop: Gaps.g16,
    paddingHorizontal: Gaps.g16,
    marginBottom: Gaps.g40,
  },
});
