import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  ScrollView,
} from "react-native";
import IconArrowBack from "@/assets/icons/IconArrowBack";
import IconAccept from "@/assets/icons/IconAccept";
import IconDismiss from "@/assets/icons/IconDismiss";
import IconPending from "@/assets/icons/IconPending";
import IconDelete from "@/assets/icons/IconDelete";
import IconAddFriend from "@/assets/icons/IconAddFriend";
import { Logo } from "@/components/Logos";
import { FontSizes, Gaps, Colors } from "@/styles/theme";
import { useRouter } from "expo-router";
import { SearchFriendInput } from "@/components/Inputs";
import {
  getFriends,
  getReceivedFriendRequests,
  getSentFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  searchUserByEmail,
  sendFriendRequest,
} from "@/utilities/friendRequestApi";
import { useEffect, useState } from "react";
import { FriendsState, User } from "@/utilities/friendInterfaces";
import { useUser } from "@clerk/clerk-expo";

const API_BASE_URL =
  process.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const ProfilFriendsScreen = () => {
  const router = useRouter();
  // get current user from Clerk:
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [searchState, setSearchState] = useState<{
    email: string;
    result: User | null;
    error: string;
  }>({
    email: "",
    result: null,
    error: "",
  });
  const [friendsState, setFriendsState] = useState<FriendsState>({
    friendList: { friends: [] },
    receivedFriendRequests: { friendRequests: [] },
    sentFriendRequests: { friendRequests: [] },
  });

  // =========== Functions ==========
  // Handler Search User
  const handleSearchUser = async (email: string) => {
    if (!email.trim() || !user) {
      setSearchState((prev) => ({
        ...prev,
        error: "Please enter a valid email",
      }));
      return;
    }

    try {
      setIsLoading(true);
      setSearchState((prev) => ({ ...prev, result: null, error: "" }));

      const result = await searchUserByEmail(email, user.id);
      setSearchState((prev) => ({ ...prev, result: result.user, email: "" }));
    } catch (error: any) {
      setSearchState((prev) => ({
        ...prev,
        result: null,
        error: "not a quizzly bear",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Handler Send Friend Request
  const handleSendFriendRequest = async (targetUserId: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      await sendFriendRequest(user.id, targetUserId);

      // Refresh the sent requests list
      const sent = await getSentFriendRequests(user.id);
      setFriendsState((prev) => ({
        ...prev,
        sentFriendRequests: sent,
      }));

      // Clear search result after sending request
      setSearchState((prev) => ({ ...prev, email: "", result: null }));
    } catch (error: any) {
      setSearchState((prev) => ({
        ...prev,
        error: error.message || "Failed to send friend request",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Handler Accept
  const handleAcceptFriendRequest = async (requestId: string) => {
    try {
      if (!user) return;
      await acceptFriendRequest(user.id, requestId);
      // Refresh the friends list after accepting
      const friends = await getFriends(user.id);
      const received = await getReceivedFriendRequests(user.id);
      const sent = await getSentFriendRequests(user.id);

      setFriendsState({
        friendList: friends,
        receivedFriendRequests: received,
        sentFriendRequests: sent,
      });
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  // Handler Decline
  const handleDeclineFriendRequest = async (requestId: string) => {
    try {
      if (!user) return;
      await declineFriendRequest(user.id, requestId);
      // Refresh the friends list after declining
      const received = await getReceivedFriendRequests(user.id);
      setFriendsState((prev) => ({
        ...prev,
        receivedFriendRequests: received,
      }));
    } catch (error) {
      console.error("Error declining friend request:", error);
    }
  };

  // Handler Remove
  const handleRemoveFriend = async (friendId: string) => {
    try {
      if (!user) return;
      await removeFriend(user.id, friendId);
      // Refresh the friends list after removing
      const friends = await getFriends(user.id);
      setFriendsState((prev) => ({
        ...prev,
        friendList: friends,
      }));
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  // =========== UseEffect ==========
  // Auto-hide error after 5 seconds
  useEffect(() => {
    if (searchState.error) {
      const timer = setTimeout(() => {
        setSearchState((prev) => ({ ...prev, error: "" }));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchState.error]);

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
        <View style={styles.logoContainer}>
          <Logo size="small" />
        </View>

        <Text style={styles.pageTitle}>Friends</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchFriendInput
            placeholder="e-mail..."
            value={searchState.email}
            onChangeText={(text: string) => {
              setSearchState((prev) => ({ ...prev, email: text }));
            }}
            onSearch={(email) => handleSearchUser(email)}
          />

          {/* Fixed space for error message */}
          <View style={styles.errorContainer}>
            {searchState.error ? (
              <Text style={styles.errorText}>{searchState.error}</Text>
            ) : null}
          </View>

          {/* Search Result */}
          {searchState.result ? (
            <View style={styles.friendRow}>
              <Text style={styles.friendName}>{searchState.result.email}</Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={() =>
                    searchState.result &&
                    handleSendFriendRequest(searchState.result._id)
                  }
                  disabled={isLoading}
                  style={styles.iconButton}
                >
                  <IconAddFriend />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>

        {/* Friend Requests (incoming) */}
        {friendsState.receivedFriendRequests.friendRequests.map((item) => (
          <View key={item._id} style={styles.friendRow}>
            <Text style={styles.friendName}>{item.from.email}</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => handleAcceptFriendRequest(item._id)}
                style={styles.iconButton}
              >
                <IconAccept />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeclineFriendRequest(item._id)}
                style={styles.iconButton}
              >
                <IconDismiss />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Sent Requests (pending) */}
        {friendsState.sentFriendRequests.friendRequests.map((item) => (
          <View key={item._id} style={styles.friendRow}>
            <Text style={styles.friendName}>
              {item.to.email || "NightPulse"}
            </Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.iconButton}>
                <IconPending />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Friends List */}
        {friendsState.friendList.friends.map((item) => (
          <View key={item._id} style={styles.friendRow}>
            <Text style={styles.friendName}>
              {item.email || item.username || "Friend"}
            </Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => handleRemoveFriend(item._id)}
                style={styles.iconButton}
              >
                <IconDelete />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Empty State */}
        {!friendsState.friendList.friends.length &&
          !friendsState.receivedFriendRequests.friendRequests.length &&
          !friendsState.sentFriendRequests.friendRequests.length && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Unfortunately, it's empty so far...
              </Text>
              <Text style={styles.emptyText}>Invite someone over.</Text>
            </View>
          )}
      </ScrollView>
    </View>
  );
};
export default ProfilFriendsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgGray,
    paddingTop: Gaps.g80,
    maxWidth: 440,
    alignSelf: "center",
    width: "100%",
  },
  scrollContent: {
    paddingHorizontal: Gaps.g16,
    paddingBottom: Gaps.g24,
  },
  backButton: {
    position: "absolute",
    top: Gaps.g80,
    left: 16,
    zIndex: 10,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Gaps.g16,
  },
  pageTitle: {
    fontSize: FontSizes.H2Fs,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: Gaps.g24,
    color: Colors.black,
  },
  searchContainer: {
    marginBottom: Gaps.g24,
  },
  errorContainer: {
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Gaps.g8,
  },
  errorText: {
    color: Colors.systemRed,
    fontSize: FontSizes.TextMediumFs,
    textAlign: "center",
  },
  friendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Gaps.g4,
    paddingHorizontal: Gaps.g16,
    marginBottom: 1,
  },
  friendName: {
    fontSize: FontSizes.TextLargeFs,
    color: Colors.black,
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    gap: Gaps.g16,
  },
  iconButton: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: Gaps.g48,
  },
  emptyText: {
    fontSize: FontSizes.TextLargeFs,
    color: Colors.black,
    textAlign: "center",
  },
});
