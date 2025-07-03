import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  ScrollView,
  FlatList,
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
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  searchUserByEmail,
  sendFriendRequest,
} from "@/utilities/friendRequestApi";
import { useEffect, useState } from "react";
import { FriendsState, User } from "@/utilities/friendInterfaces";
import { useUser } from "@clerk/clerk-expo";
import FriendItem from "@/components/FriendItem";

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
    email:"",
    result:null,
      error: "",
  })
  const [friendsState, setFriendsState] = useState<FriendsState>({
    friendList: { friends: [] },
    receivedFriendRequests: { friendRequests: [] },
    sentFriendRequests: { friendRequests: [] },
  });

  // =========== Functions ==========
  // Handler Search User
  const handleSearchUser = async (email: string) => {
    if (!email.trim() || !user) {
      setSearchState((prev) => ({...prev, error:"Please enter a valid email"}))
      return;
    }

    try {
      setIsLoading(true);
      setSearchState((prev) => ({...prev, result:null, error:""}));
      
      const result = await searchUserByEmail(email, user.id);
      setSearchState((prev) => ({...prev, result:result.user}))
    } catch (error: any) {
      setSearchState((prev) => ({...prev, result:null, error:error.message || "User not found"}))
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
      setFriendsState(prev => ({
        ...prev,
        sentFriendRequests: sent,
      }));
      
      // Clear search result after sending request
      setSearchState((prev) => ({...prev,email:"", result:null}));
      
    } catch (error: any) {
      setSearchState((prev) => ({...prev, error:error.message || "Failed to send friend request"}))
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
        <View style={{ marginBottom: Gaps.g16 }}>
          <Logo size="small" />
        </View>

        {/* Search Bar */}
        <View style={styles.searchFriendsBox}>
          <Text style={{ fontSize: FontSizes.H2Fs }}>Friends</Text>
          <SearchFriendInput 
            placeholder="e-mail..." 
            value={searchState.email} 
            onChangeText={(text:string) => setSearchState((prev) => ({...prev, email: text}))}
            onSearch={() => handleSearchUser(searchState.email)}
          />

          {/* Search Error */}
          {searchState.error ? (
            <Text>{searchState.error}</Text>
          ) : null}

          {/* Search Result */}
          {searchState.result ? (
            <View >
              <Text >Found: {searchState.result.email}</Text>
              <TouchableOpacity
                onPress={() => searchState.result && handleSendFriendRequest(searchState.result._id)}
                disabled={isLoading}
              >
                <Text >
                  {isLoading ? "Sending..." : "Send Friend Request"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Friend List */}
          {!friendsState.friendList.friends.length &&
          !friendsState.receivedFriendRequests.friendRequests.length &&
          !friendsState.sentFriendRequests.friendRequests.length ? (
            //==== if you don't have friends yet ====
            <View style={styles.textBox}>
              <Text style={{ fontSize: FontSizes.TextLargeFs }}>
                Unfortunately, it's empty so far...?
              </Text>
              <Text style={{ fontSize: FontSizes.TextLargeFs }}>
                Invite someone over.
              </Text>
            </View>
          ) : (
            // ==== if you have friends or requests ====
            <View style={styles.textBox}>
              {/* If there are current friend requests */}
              {friendsState.receivedFriendRequests.friendRequests.length >
                0 && (
                <View>
                  <Text style={{ fontSize: FontSizes.TextLargeFs }}>
                    Friend Requests
                  </Text>
                  <FlatList
                    data={friendsState.receivedFriendRequests.friendRequests}
                    renderItem={({ item }) => (
                      <FriendItem
                        friend={item.from}
                        friendStatus="request"
                        onPressOne={() => handleAcceptFriendRequest(item._id)}
                        onPressTwo={() => handleDeclineFriendRequest(item._id)}
                      />
                    )}
                    keyExtractor={(item) => item._id}
                    scrollEnabled={false}
                  />
                </View>
              )}

              {/* If you have pending request to others */}
              {friendsState.sentFriendRequests.friendRequests.length > 0 && (
                <View>
                  <Text style={{ fontSize: FontSizes.TextLargeFs }}>
                    Your pending requests
                  </Text>
                  <FlatList
                    data={friendsState.sentFriendRequests.friendRequests}
                    renderItem={({ item }) => (
                      <FriendItem
                        friend={item.to}
                        friendStatus="outstanding"
                        onPressOne={() => {}}
                        onPressTwo={() => {}}
                      />
                    )}
                    keyExtractor={(item) => item._id}
                    scrollEnabled={false}
                  />
                </View>
              )}

              {/* If you have friends */}
              {friendsState.friendList.friends.length > 0 && (
                <View>
                  <Text style={{ fontSize: FontSizes.TextLargeFs }}>
                    Your Friends
                  </Text>
                  <FlatList
                    data={friendsState.friendList.friends}
                    renderItem={({ item }) => (
                      <FriendItem
                        friend={item}
                        friendStatus="friend"
                        onPressOne={() => handleRemoveFriend(item._id)}
                        onPressTwo={() => {}}
                      />
                    )}
                    keyExtractor={(item) => item._id}
                    scrollEnabled={false}
                  />
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};
export default ProfilFriendsScreen;

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
