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
import { useEffect, useState, useContext } from "react";
import { FriendsState, User } from "@/utilities/friendInterfaces";
import { UserContext } from "@/providers/UserProvider";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import socketService from "@/utilities/socketService";

// const API_BASE_URL = "http://localhost:3000/api";
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const ProfilFriendsScreen = () => {
  const router = useRouter();
  const { userData } = useContext(UserContext);
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

  // State for friend IDs for online status tracking
  const [friendIds, setFriendIds] = useState<string[]>([]);
  
  // Use the online status hook
  const { isUserOnline } = useOnlineStatus(friendIds);

  // =========== Functions ==========
  // Handler Search User
  const handleSearchUser = async (email: string) => {
    if (!email.trim() || !userData) {
      setSearchState((prev) => ({
        ...prev,
        error: "Please enter a valid email",
      }));
      return;
    }

    try {
      setIsLoading(true);
      setSearchState((prev) => ({ ...prev, result: null, error: "" }));

      const result = await searchUserByEmail(email, userData.clerkUserId);
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
    if (!userData) return;

    try {
      setIsLoading(true);
      await sendFriendRequest(userData.clerkUserId, targetUserId);

      // Refresh the sent requests list
      const sent = await getSentFriendRequests(userData.clerkUserId);
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
      if (!userData) return;
      await acceptFriendRequest(userData.clerkUserId, requestId);
      // Refresh the friends list after accepting
      const friends = await getFriends(userData.clerkUserId);
      const received = await getReceivedFriendRequests(userData.clerkUserId);
      const sent = await getSentFriendRequests(userData.clerkUserId);

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
      if (!userData) return;
      await declineFriendRequest(userData.clerkUserId, requestId);
      // Refresh the friends list after declining
      const received = await getReceivedFriendRequests(userData.clerkUserId);
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
      if (!userData) return;
      await removeFriend(userData.clerkUserId, friendId);
      // Refresh the friends list after removing
      const friends = await getFriends(userData.clerkUserId);
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
  // useEffect(() => {
  //   if (searchState.error) {
  //     const timer = setTimeout(() => {
  //       setSearchState((prev) => ({ ...prev, error: "" }));
  //     }, 5000);

  //     return () => clearTimeout(timer);
  //   }
  // }, [searchState.error]);

  useEffect(() => {
    if (!userData) {
      return;
    }
    // Fetch friends when the component mounts
    const fetchFriends = async () => {
      try {
        const clerkUserId = userData.clerkUserId;

        const friends = await getFriends(clerkUserId);
        const received = await getReceivedFriendRequests(clerkUserId);
        const sent = await getSentFriendRequests(clerkUserId);

        setFriendsState({
          friendList: friends,
          receivedFriendRequests: received,
          sentFriendRequests: sent,
        });

        // Debug: Log the actual friend data to see what we're getting
        console.log('🔍 DEBUG - Friend data from server:', friends);
        console.log('🔍 DEBUG - First friend object:', friends.friends?.[0]);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };
    fetchFriends();
  }, []);

  // Connect to socket when user is available
  useEffect(() => {
    if (userData && !socketService.isConnected()) {
      const connectSocket = async () => {
        try {
          console.log('🔌 Connecting socket for user:', userData.clerkUserId);
          await socketService.connect();
          console.log('✅ Socket connected for online status tracking');
        } catch (error) {
          console.error('❌ Failed to connect socket:', error);
        }
      };
      connectSocket();
    }
  }, [userData]);

  // Debug: Log friend IDs when they change
  useEffect(() => {
    console.log('👥 Friend IDs for tracking:', friendIds);
  }, [friendIds]);

  // Update friendIds when friends list changes
  useEffect(() => {
    console.log('🔍 DEBUG - Full friends state:', friendsState.friendList);
    console.log('🔍 DEBUG - Friends array:', friendsState.friendList.friends);
    
    // Use MongoDB _id instead of clerkUserId since clerkUserId is not available
    const newFriendIds = friendsState.friendList.friends
      .map(friend => {
        console.log('🔍 DEBUG - Processing friend:', JSON.stringify(friend, null, 2));
        console.log('🔍 DEBUG - Friend _id:', friend._id);
        console.log('🔍 DEBUG - Friend keys:', Object.keys(friend));
        return friend._id; // Use _id instead of clerkUserId
      })
      .filter(Boolean) as string[];
    
    console.log('🔄 Updating friendIds state (using _id):', newFriendIds);
    setFriendIds(newFriendIds);
  }, [friendsState.friendList.friends]);

  // Auto-hide error after 5 seconds
  useEffect(() => {
    if (searchState.error) {
      const timer = setTimeout(() => {
        setSearchState((prev) => ({ ...prev, error: "" }));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchState.error]);

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
            <Text style={styles.friendName}>{item.to.email}</Text>
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
            <View style={styles.friendInfo}>
              {/* Online Status Indicator */}
              <View 
                style={[
                  styles.statusDot,
                  { backgroundColor: isUserOnline(item._id || '') ? '#4CAF50' : '#9E9E9E' }
                ]}
              />
              <View style={styles.friendTextContainer}>
                <Text style={styles.friendName}>
                  {item.email || item.username || "Friend"}
                </Text>
                <Text style={[
                  styles.statusText,
                  { color: isUserOnline(item._id || '') ? '#4CAF50' : '#9E9E9E' }
                ]}>
                  {isUserOnline(item._id || '') ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>
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
  // =============== NEW added from Co-Pilot ===============
  friendInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Gaps.g8,
  },
  friendTextContainer: {
    flex: 1,
  },
   statusText: {
    fontSize: FontSizes.TextSmallFs,
    marginTop: 2,
  },
  // =======================================================
});
