import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  ScrollView,
} from "react-native";
import IconArrowBack from "@/assets/icons/IconArrowBack";
import { Logo } from "@/components/Logos";
import { FontSizes, Gaps, Colors } from "@/styles/theme";
import { useRouter } from "expo-router";
import { ButtonPrimary } from "@/components/Buttons";
import { SearchFriendInput } from "@/components/Inputs";
import {
  getFriends,
  getReceivedFriendRequests,
  getSentFriendRequests,
} from "@/utilities/friendRequestApi";
import { useEffect, useState } from "react";
import {
  FriendsState,
} from "@/utilities/friendInterfaces";
import { useUser } from "@clerk/clerk-expo";

const API_BASE_URL =
  process.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const ProfilInvitationsScreen = () => {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [friendsState, setFriendsState] = useState<FriendsState>({
    friendList: { friends: [] },
    receivedFriendRequests: { friendRequests: [] },
    sentFriendRequests: { friendRequests: [] },
  });
  const { user } = useUser();

  useEffect(() => {
    if (!user) {
      return;
    }
    // Fetch friends when the component mounts
    const fetchFriends = async () => {
      try {
        const clerkUserId = user.id;

        const friends = await getFriends(clerkUserId);
        const received = await getReceivedFriendRequests(clerkUserId);
        const sent = await getSentFriendRequests(clerkUserId);

        setFriendsState({
          friendList: friends,
          receivedFriendRequests: received,
          sentFriendRequests: sent,
        });
        console.log("FriendsState:", friendsState);
        
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };
    fetchFriends();
  }, []);

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

        {/*==== if you don't have friends yet ====*/}
        <View style={styles.searchFriendsBox}>
          <Text style={{ fontSize: FontSizes.H2Fs }}>Friends</Text>
          <SearchFriendInput placeholder="e-mail..." />
          <View style={styles.textBox}>
            <Text style={{ fontSize: FontSizes.TextLargeFs }}>
              Unfortunately, it's empty so far...?
            </Text>
            <Text style={{ fontSize: FontSizes.TextLargeFs }}>
              Invite someone over.
            </Text>
          </View>
        </View>

        {/*==== if you already have friends ====*/}
        {/* CODE HERE */}
      </ScrollView>
    </View>
  );
};
export default ProfilInvitationsScreen;

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
  searchFriendsBox: {
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    gap: Gaps.g32,
  },
  textBox: {
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
  },
});
