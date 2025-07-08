import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons";
import { Logo } from "@/components/Logos";
import IconArrowBack from "@/assets/icons/IconArrowBack";
import { FontSizes, Gaps } from "@/styles/theme";
import { loadCacheData, CACHE_KEY } from "@/utilities/cacheUtils";
import CustomAlert from "@/components/CustomAlert";
import {
  searchUserByEmail,
  sendInviteRequest,
} from "@/utilities/invitationApi";
import { getFriends, sendFriendRequest } from "@/utilities/friendRequestApi";
import { FriendsResponse, User } from "@/utilities/friendInterfaces";
import { SearchFriendInput } from "@/components/Inputs";
import IconAddFriend from "@/assets/icons/IconAddFriend";
import { UserContext } from "@/providers/UserProvider";

interface RoomInfo {
  roomId: string;
  room: any;
  isHost: boolean;
  isAdmin: boolean;
}

const InviteFriendsScreen = () => {
  const router = useRouter();
  const { userData } = useContext(UserContext);

  const [showNoFriendsAlert, setShowNoFriendsAlert] = useState(false);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [friends, setFriends] = useState<FriendsResponse>({ friends: [] });
  // New for invites:
  const [nonFriends, setNonFriends] = useState<User[]>([]);
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

  // =========== Functions ==========
  // ----- Handler Fetch Friendlist -----
  const fetchFriends = async () => {
    try {
      if (!userData) return;
      setIsLoading(true);
      const clerkUserId = userData.clerkUserId;

      const friends = await getFriends(clerkUserId);

      setFriends(friends);
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ----- Handler Search User -----
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

      if (result.user) {
        setSearchState((prev) => ({
          ...prev,
          result: result.user,
          email: email,
        }));

        // Check if user is already a friend
        const isAlreadyFriend = friends.friends.some(
          (friend) => friend._id === result.user._id
        );

        if (isAlreadyFriend) {
          // User is already a friend - just select them for invitation
          setSelectedFriends((prev) => {
            if (!prev.includes(result.user._id)) {
              return [...prev, result.user._id];
            }
            return prev;
          });
        } else {
          // User is not a friend - add to nonFriends list and select for invitation
          setNonFriends((prev) => {
            const isAlreadyInNonFriends = prev.some(
              (user) => user._id === result.user._id
            );
            if (!isAlreadyInNonFriends) {
              return [...prev, result.user];
            }
            return prev;
          });

          // Add to selected friends for invitation
          setSelectedFriends((prev) => {
            if (!prev.includes(result.user._id)) {
              return [...prev, result.user._id];
            }
            return prev;
          });
        }
      }
    } catch (error: any) {
      setSearchState((prev) => ({
        ...prev,
        result: null,
        error: "Not a quizzly bear",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // ----- Handler Send Friend Request -----
  const handleSendFriendRequest = async (targetUserId: string) => {
    if (!userData) return;

    try {
      setIsLoading(true);
      await sendFriendRequest(userData.clerkUserId, targetUserId);

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

  // ----- Handler Send Invite Request -----
  const handleSendInviteRequest = async (targetUserId: string) => {
    if (!userData) return;

    try {
      setIsLoading(true);
      await sendInviteRequest(
        userData.clerkUserId,
        targetUserId,
        roomInfo?.roomId || ""
      );

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

  // ----- Load Room Info -----
  const loadRoomInfo = async () => {
    try {
      const cachedRoomInfo = await loadCacheData(CACHE_KEY.currentRoom);
      if (cachedRoomInfo) {
        setRoomInfo(cachedRoomInfo);
      }
    } catch (error) {
      console.error("Error loading room info:", error);
    }
  };

  // ----- Toggle Friend Selection -----
  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends((prev) => {
      if (prev.includes(friendId)) {
        return prev.filter((id) => id !== friendId);
      } else {
        return [...prev, friendId];
      }
    });
  };

  // ----- Custom Alert handlers -----
  const handleNoFriendsAlertClose = () => {
    setShowNoFriendsAlert(false);
  };

  // ----- Handle Invite Friends -----
  const handleInviteFriends = async () => {
    if (selectedFriends.length === 0) {
      setShowNoFriendsAlert(true);
      return;
    }

    try {
      setIsLoading(true);
      // Send invitations to all selected users (both friends and non-friends)
      const invitePromises = selectedFriends.map((userId) =>
        handleSendInviteRequest(userId)
      );
      await Promise.all(invitePromises);
      // Go to lobby after sending invitations
      router.push("/(tabs)/play/MultiplayerLobby");
    } catch (error) {
      console.error("Error sending invitations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // =========== UseEffect ==========
  useEffect(() => {
    loadRoomInfo();
    fetchFriends();
  }, []);

  // ========== Render Functions ==========
  // ----- Render Friend Item ----- TODO check online status
  const renderFriendItem = ({ item }: { item: User }) => {
    const isSelected = selectedFriends.includes(item._id);
    return (
      <TouchableOpacity
        style={[styles.friendItem, isSelected && styles.friendItemSelected]}
        onPress={() => toggleFriendSelection(item._id)}
        // disabled={!item.isOnline}
      >
        <View style={styles.friendInfo}>
          {/* <View style={[styles.avatar, !item.isOnline && styles.avatarOffline]}> */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.username?.charAt(0) || item.email.charAt(0)}
            </Text>
          </View>
          <View style={styles.friendDetails}>
            <Text style={styles.friendName}>{item.username || item.email}</Text>
            <Text style={styles.friendStatus}>
              {" "}
              Online/ Offline
              {/* {item.isOnline ? "Online" : "Offline"} */}
            </Text>
          </View>
        </View>
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Text style={styles.selectedText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // ----- Render Non-Friend Item (with Add Friend button) -----
  const renderNonFriendItem = ({ item }: { item: User }) => {
    const isSelected = selectedFriends.includes(item._id);
    return (
      <TouchableOpacity
        style={[styles.friendItem, isSelected && styles.friendItemSelected]}
        onPress={() => toggleFriendSelection(item._id)}
      >
        <View style={styles.friendInfo}>
          <View style={[styles.avatar, styles.nonFriendAvatar]}>
            <Text style={styles.avatarText}>
              {item.username?.charAt(0) || item.email.charAt(0)}
            </Text>
          </View>
          <View style={styles.friendDetails}>
            <Text style={styles.friendName}>{item.username || item.email}</Text>
            <Text style={[styles.friendStatus, styles.nonFriendStatus]}>
              Not a friend yet
            </Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          {isSelected && (
            <View style={styles.selectedIndicator}>
              <Text style={styles.selectedText}>✓</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => handleSendFriendRequest(item._id)}
            disabled={isLoading}
            style={styles.addFriendButton}
          >
            <IconAddFriend />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (!roomInfo) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Loading room...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        accessibilityLabel="Go back"
      >
        <IconArrowBack />
      </TouchableOpacity>

      <View style={{ marginBottom: Gaps.g24 }}>
        <Logo size="small" />
      </View>

      <Text style={styles.title}>Invite Quizzly Bears</Text>
      <Text style={styles.subtitle}>Room ID: {roomInfo.roomId}</Text>

      <View style={styles.selectionInfo}>
        <Text style={styles.selectionText}>
          Selected: {selectedFriends.length} Quizzly Bears
        </Text>
      </View>

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
        {searchState.result && (
          <View style={styles.searchResultContainer}>
            <Text style={styles.searchResultText}>
              User found: {searchState.result.email}
            </Text>
            <Text style={styles.searchResultSubtext}>
              {friends.friends.some(
                (friend) => friend._id === searchState.result?._id
              )
                ? "Added to your list below"
                : "Added to list below"}
            </Text>
          </View>
        )}
      </View>

      <FlatList
        data={[...friends.friends, ...nonFriends]}
        renderItem={({ item }) => {
          const isFriend = friends.friends.some(
            (friend) => friend._id === item._id
          );
          return isFriend
            ? renderFriendItem({ item })
            : renderNonFriendItem({ item });
        }}
        keyExtractor={(item) => item._id}
        style={styles.friendsList}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.buttonContainer}>
        <ButtonSecondary
          text="Skip & Continue"
          onPress={() => router.push("/(tabs)/play/MultiplayerLobby")}
        />
        <ButtonPrimary
          text={`Invite ${selectedFriends.length} Quizzly Bears`}
          onPress={handleInviteFriends}
        />
      </View>

      {/* Custom Alert */}
      <CustomAlert
        visible={showNoFriendsAlert}
        onClose={handleNoFriendsAlertClose}
        title="No Quizzly Bear Selected"
        message="Please select at least one Quizzly Bear to invite"
        cancelText={null}
        confirmText="OK"
        onConfirm={handleNoFriendsAlertClose}
        noInternet={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Gaps.g80,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backButton: {
    position: "absolute",
    top: -8,
    left: 16,
    zIndex: 10,
  },
  title: {
    fontSize: FontSizes.H1Fs,
    fontWeight: "bold",
    marginBottom: Gaps.g8,
  },
  subtitle: {
    fontSize: FontSizes.TextMediumFs,
    marginBottom: Gaps.g24,
    color: "#666",
  },
  selectionInfo: {
    alignSelf: "flex-start",
    marginBottom: Gaps.g16,
  },
  selectionText: {
    fontSize: FontSizes.TextMediumFs,
    fontWeight: "500",
  },
  friendsList: {
    flex: 1,
    width: "100%",
  },
  friendItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Gaps.g16,
    marginBottom: Gaps.g8,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  friendItemSelected: {
    backgroundColor: "#e3f2fd",
    borderColor: "#2196f3",
  },
  friendInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2196f3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Gaps.g16,
  },
  avatarOffline: {
    backgroundColor: "#bdbdbd",
  },
  avatarText: {
    color: "white",
    fontWeight: "bold",
    fontSize: FontSizes.TextMediumFs,
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: FontSizes.TextMediumFs,
    fontWeight: "500",
    marginBottom: 2,
  },
  friendNameOffline: {
    color: "#999",
  },
  friendStatus: {
    fontSize: FontSizes.TextSmallFs,
    color: "#666",
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4caf50",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  buttonContainer: {
    width: "100%",
    gap: Gaps.g16,
    paddingBottom: Gaps.g24,
  },
  errorText: {
    fontSize: FontSizes.TextLargeFs,
    color: "#666",
  },
  // Added styles from ProfileFriendsScreen.tsx
  searchContainer: {
    marginBottom: Gaps.g24,
  },
  errorContainer: {
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Gaps.g8,
  },
  friendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Gaps.g4,
    paddingHorizontal: Gaps.g16,
    marginBottom: 1,
  },
  actionButtons: {
    flexDirection: "row",
    gap: Gaps.g16,
  },
  iconButton: {
    padding: 4,
  },
  // Added by Co-Pilot for non-friend styling
  nonFriendAvatar: {
    backgroundColor: "#ff9800", // Orange color for non-friends
  },
  nonFriendStatus: {
    color: "#ff9800",
    fontStyle: "italic",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addFriendButton: {
    padding: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  searchResultContainer: {
    backgroundColor: "#e8f5e8",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  searchResultText: {
    fontSize: FontSizes.TextMediumFs,
    fontWeight: "500",
    color: "#2e7d32",
  },
  searchResultSubtext: {
    fontSize: FontSizes.TextSmallFs,
    color: "#4caf50",
    marginTop: 4,
  },
});

export default InviteFriendsScreen;
