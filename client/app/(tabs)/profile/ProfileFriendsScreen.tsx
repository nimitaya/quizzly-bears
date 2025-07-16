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
import { FontSizes, Gaps, Colors, Radius } from "@/styles/theme";
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
import socketService from "@/utilities/socketService";

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

  useEffect(() => {
    console.log("ProfileFriendsScreen mounted");
    return () => console.log("ProfileFriendsScreen unmounted");
  }, []);

  useEffect(() => {
    console.log(
      "userData changed:",
      userData
        ? {
            id: userData._id,
            clerkId: userData.clerkUserId,
            email: userData.email,
          }
        : "No userData"
    );
  }, [userData]);

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
  useEffect(() => {
    if (searchState.error) {
      const timer = setTimeout(() => {
        setSearchState((prev) => ({ ...prev, error: "" }));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchState.error]);

  useEffect(() => {
    if (!userData?.clerkUserId) {
      return;
    }

    console.log(
      "Fetching friends data with clerkUserId:",
      userData.clerkUserId
    );

    // Fetch friends when userData becomes available
    const fetchFriends = async () => {
      try {
        setIsLoading(true); // Add loading state
        const clerkUserId = userData.clerkUserId;

        const friends = await getFriends(clerkUserId);
        const received = await getReceivedFriendRequests(clerkUserId);
        const sent = await getSentFriendRequests(clerkUserId);

        setFriendsState({
          friendList: friends,
          receivedFriendRequests: received,
          sentFriendRequests: sent,
        });
        console.log("Friends data loaded:", {
          friendCount: friends.friends.length,
          receivedCount: received.friendRequests.length,
          sentCount: sent.friendRequests.length,
        });
      } catch (error) {
        console.error("Error fetching friends:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriends();
  }, [userData?.clerkUserId]); // Add userData as dependency

  useEffect(() => {
    if (!userData) return;

    // Function to set up all socket listeners
    const setupSocketListeners = () => {
      console.log("Setting up friend event listeners...");

      // Clean up existing listeners first to avoid duplicates
      socketService.off("friendRequestSent");
      socketService.off("friendRequestAccepted");
      socketService.off("friendRequestDeclined");
      socketService.off("friendRemoved");

      // Register new listeners
      socketService.on("friendRequestSent", (data: any) => {
        console.log("🔔 Friend request SENT event received:", data);
        if (userData) {
          getReceivedFriendRequests(userData.clerkUserId).then((received) => {
            console.log("Updated received requests:", received);
            setFriendsState((prev) => ({
              ...prev,
              receivedFriendRequests: received,
            }));
          });
        }
      });

      socketService.on("friendRequestAccepted", (data: any) => {
        console.log("Friend request accepted:", data);

        if (userData) {
          const clerkUserId = userData.clerkUserId;

          // Update the friends list
          getFriends(clerkUserId).then((friends) => {
            setFriendsState((prev) => ({
              ...prev,
              friendList: friends,
            }));
          });

          // Update the requests list (remove the accepted one)
          getSentFriendRequests(clerkUserId).then((sent) => {
            setFriendsState((prev) => ({
              ...prev,
              sentFriendRequests: sent,
            }));
          });
        }
      });

      socketService.on("friendRequestDeclined", (data: any) => {
        console.log("Friend request declined:", data);

        // Update the received friend requests list
        if (userData) {
          getReceivedFriendRequests(userData.clerkUserId).then((received) => {
            setFriendsState((prev) => ({
              ...prev,
              receivedFriendRequests: received,
            }));
          });
          getSentFriendRequests(userData.clerkUserId).then((sent) => {
            setFriendsState((prev) => ({
              ...prev,
              sentFriendRequests: sent,
            }));
          });
        }
      });

      socketService.on("friendRemoved", (data: any) => {
        console.log("Friend removed:", data);

        // Update the friends list
        if (userData) {
          getFriends(userData.clerkUserId).then((friends) => {
            setFriendsState((prev) => ({
              ...prev,
              friendList: friends,
            }));
          });
        }
      });
    };

    // Set up listeners initially
    setupSocketListeners();

    // Re-register listeners when socket connects
    socketService.on("connect", () => {
      console.log("Socket reconnected, re-registering listeners");
      setupSocketListeners();
    });

    return () => {
      console.log("Cleaning up socket listeners");
      socketService.off("friendRequestSent");
      socketService.off("friendRequestAccepted");
      socketService.off("friendRequestDeclined");
      socketService.off("friendRemoved");
      socketService.off("connect");
    };
  }, [userData]);

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
            clerkUserId={userData?.clerkUserId}
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
          {/* Refresh Button - Added manually */}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => {
            console.log("Manual refresh triggered");
            if (userData?.clerkUserId) {
              const fetchFriends = async () => {
                try {
                  setIsLoading(true);
                  const clerkUserId = userData.clerkUserId;

                  const friends = await getFriends(clerkUserId);
                  const received = await getReceivedFriendRequests(clerkUserId);
                  const sent = await getSentFriendRequests(clerkUserId);

                  setFriendsState({
                    friendList: friends,
                    receivedFriendRequests: received,
                    sentFriendRequests: sent,
                  });
                  console.log("Friends data refreshed manually");
                } catch (error) {
                  console.error("Error refreshing friends:", error);
                } finally {
                  setIsLoading(false);
                }
              };
              fetchFriends();
            }
          }}
        >
          <Text style={styles.refreshButtonText}>Refresh Friends</Text>
        </TouchableOpacity>
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
    //maxWidth: 440,
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
    textAlign: "center",
    marginBottom: Gaps.g24,
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
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    gap: Gaps.g16,
  },
  iconButton: {
    padding: Gaps.g4,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: Gaps.g48,
  },
  emptyText: {
    fontSize: FontSizes.TextLargeFs,
    textAlign: "center",
  },
  refreshButton: {
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    gap: Gaps.g8,
    paddingHorizontal: Gaps.g16,
    height: 56,
    width: 348,
    alignSelf: "center",
    borderRadius: Radius.r50,
    marginTop: Gaps.g32,
  },
  refreshButtonText: {
    color: Colors.darkGreen,
    fontSize: FontSizes.TextLargeFs,
  },
});
