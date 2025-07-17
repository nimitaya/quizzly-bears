import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { ButtonPrimary } from "@/components/Buttons";
import { Logo } from "@/components/Logos";
import IconArrowBack from "@/assets/icons/IconArrowBack";
import { Colors, FontSizes, Gaps } from "@/styles/theme";
import {
  loadCacheData,
  saveDataToCache,
  CACHE_KEY,
} from "@/utilities/cacheUtils";
import CustomAlert from "@/components/CustomAlert";
import {
  searchUserByEmail,
  sendInviteRequest,
  removeAllInvites,
  getSentInviteRequests,
} from "@/utilities/invitationApi";
import { getFriends, sendFriendRequest } from "@/utilities/friendRequestApi";
import { FriendsResponse, User } from "@/utilities/friendInterfaces";
import { SearchFriendInput } from "@/components/Inputs";
import IconAddFriend from "@/assets/icons/IconAddFriend";
import { UserContext } from "@/providers/UserProvider";
import { Checkbox } from "@/components/Checkbox";
import { RadioButton } from "@/components/RadioButton";
import { socketService } from "@/utilities/socketService";
import { InviteRequest } from "@/utilities/invitationInterfaces";

interface RoomInfo {
  roomId: string;
  room: any;
  isHost: boolean;
  isAdmin: boolean;
}

const InviteFriendsScreen = () => {
  const router = useRouter();
  const { userData, onlineFriends = [] } = useContext(UserContext);

  const [showNoFriendsAlert, setShowNoFriendsAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [friends, setFriends] = useState<FriendsResponse>({ friends: [] });

  const [nonFriends, setNonFriends] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gameStyle, setGameStyle] = useState<"duel" | "group" | null>(null);
  const [searchState, setSearchState] = useState<{
    email: string;
    result: User | null;
    error: string;
  }>({
    email: "",
    result: null,
    error: "",
  });

  const [sentInvites, setSentInvites] = useState<InviteRequest[]>([]);

  // Add this state to track friend request status
  const [sentFriendRequests, setSentFriendRequests] = useState<string[]>([]);

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

  const fetchSentInvites = async () => {
    try {
      if (!userData) return;
      const clerkUserId = userData.clerkUserId;

      const sent = await getSentInviteRequests(clerkUserId);
      setSentInvites(sent.inviteRequests || []);
      if (sent.inviteRequests && sent.inviteRequests.length === 0) {
        router.replace("/(tabs)/play/InviteFriendsScreen");
      }
      console.log("Updated sent invites:", sent.inviteRequests || []);
    } catch (error) {
      console.error("Error fetching sent invites:", error);
    }
  };

  const handleInviteDeclined = (data: any) => {
    console.log("Invite request declined:", data);

    fetchSentInvites();
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
          email: "", // Clear the input field after successful search
        }));

        // Check if user is already a friend
        const isAlreadyFriend = friends.friends.some(
          (friend) => friend._id === result.user._id
        );

        if (isAlreadyFriend) {
          // User is already a friend - select them for invitation
          setSelectedFriends((prev) => {
            if (gameStyle === "duel") {
              // In duel mode, replace any existing selection
              return [result.user._id];
            } else {
              // In group mode, add to selection if not already included
              if (!prev.includes(result.user._id)) {
                return [...prev, result.user._id];
              }
              return prev;
            }
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
            if (gameStyle === "duel") {
              // In duel mode, replace any existing selection
              return [result.user._id];
            } else {
              // In group mode, add to selection if not already included
              if (!prev.includes(result.user._id)) {
                return [...prev, result.user._id];
              }
              return prev;
            }
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

      // Add user to sent requests list
      setSentFriendRequests((prev) => [...prev, targetUserId]);

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

  // ----- Handler Remove ALL Invitations -----
  const handleRemoveAllInvites = async () => {
    try {
      if (!userData) return;
      await removeAllInvites(userData.clerkUserId);
    } catch (error) {
      console.error("Error removing all invitations:", error);
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

  // ----- Load Game Style -----
  const loadGameStyle = async () => {
    try {
      const cachedQuizSettings = await loadCacheData(CACHE_KEY.quizSettings);
      if (cachedQuizSettings && cachedQuizSettings.quizPlayStyle) {
        setGameStyle(cachedQuizSettings.quizPlayStyle);
      }
    } catch (error) {
      console.error("Error loading game style:", error);
    }
  };

  // ----- Toggle Friend Selection -----
  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends((prev) => {
      if (gameStyle === "duel") {
        // For duel mode, only allow one selection
        return prev.includes(friendId) ? [] : [friendId];
      } else {
        // For group mode, allow multiple selections
        if (prev.includes(friendId)) {
          return prev.filter((id) => id !== friendId);
        } else {
          return [...prev, friendId];
        }
      }
    });
  };

  // ----- Custom Alert handlers -----
  const handleNoFriendsAlertClose = () => {
    setShowNoFriendsAlert(false);
  };

  const handleErrorAlertClose = () => {
    setShowErrorAlert(false);
    setErrorMessage("");
  };

  // ----- Handle Invite Friends -----
  const handleInviteFriends = async () => {
    if (selectedFriends.length === 0) {
      setShowNoFriendsAlert(true);
      return;
    }

    if (gameStyle === "duel" && selectedFriends.length > 1) {
      // This shouldn't happen due to our selection logic, but just in case
      setErrorMessage("You can only challenge one player in duel mode");
      setShowErrorAlert(true);
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
  }; // ----- Leave Room -----
  const leaveRoom = async () => {
    try {
      // If we have room info and user data, leave the socket room
      if (roomInfo && userData) {
        if (socketService.isConnected()) {
          socketService.leaveRoom(roomInfo.roomId, userData.clerkUserId);
        }
      }
      // Clear cache for current room
      await saveDataToCache(CACHE_KEY.currentRoom, null);
      // Delete sent invitations
      await handleRemoveAllInvites();
      // Navigate back
      router.push("/(tabs)/play");
    } catch (error) {
      console.error("Error leaving room:", error);
      // Still navigate back even if there's an error
      router.push("/(tabs)/play");
    }
  };

  // =========== UseEffect ==========
  useEffect(() => {
    loadRoomInfo();
    loadGameStyle();
    fetchFriends();
  }, []);

  useEffect(() => {
    // Register socket listener for declined invitations
    socketService.on("inviteRequestDeclined", handleInviteDeclined);

    // Cleanup socketService listener on unmount
    return () => {
      socketService.off("inviteRequestDeclined", handleInviteDeclined);
    };
  }, [userData]);

  // Auto-hide error message after 5 seconds
  useEffect(() => {
    if (searchState.error) {
      const timer = setTimeout(() => {
        setSearchState((prev) => ({ ...prev, error: "" }));
      }, 5000); // 5 seconds

      return () => clearTimeout(timer); // Cleanup timer on unmount or error change
    }
  }, [searchState.error]);

  // Auto-hide search result message after 3 seconds
  useEffect(() => {
    if (searchState.result) {
      const timer = setTimeout(() => {
        setSearchState((prev) => ({ ...prev, result: null }));
      }, 5000); // 5 seconds

      return () => clearTimeout(timer); // Cleanup timer on unmount or result change
    }
  }, [searchState.result]);

  // Add this useEffect to request and update online status
  useEffect(() => {
    if (!userData || !friends.friends.length) return;

    const friendIds = friends.friends.map((friend) => friend._id);
    if (friendIds.length > 0) {
      console.log("Requesting online status for friends");
      socketService.getFriendsStatus(userData._id, friendIds);
    }

    // Set up periodic refresh
    const refreshInterval = setInterval(() => {
      if (friendIds.length > 0 && userData._id) {
        socketService.getFriendsStatus(userData._id, friendIds);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(refreshInterval);
  }, [userData, friends.friends]);

  // Add socket reconnection handling
  useEffect(() => {
    if (!userData || !friends.friends.length) return;

    const handleSocketReconnect = () => {
      console.log("Socket reconnected, refreshing online status");
      const friendIds = friends.friends.map((friend) => friend._id);

      if (friendIds.length > 0 && userData._id) {
        socketService.getFriendsStatus(userData._id, friendIds);
      }
    };

    // Listen for socket reconnection
    socketService.on("connect", handleSocketReconnect);

    return () => {
      socketService.off("connect", handleSocketReconnect);
    };
  }, [userData, friends.friends]);

  // ========== Render Functions ==========
  // ----- Render Friend Item -----
  const renderFriendItem = ({ item }: { item: User }) => {
    const isSelected = selectedFriends.includes(item._id);
    const isOnline = onlineFriends.includes(item._id);

    return (
      <TouchableOpacity
        style={[styles.friendItem, isSelected && styles.friendItemSelected]}
        onPress={() => toggleFriendSelection(item._id)}
      >
        <View style={styles.friendInfo}>
          {/* Show appropriate selection component based on game style */}
          {gameStyle === "duel" ? (
            <RadioButton
              label=""
              selected={isSelected}
              onChange={() => toggleFriendSelection(item._id)}
            />
          ) : (
            <Checkbox
              label=""
              checked={isSelected}
              onChange={() => toggleFriendSelection(item._id)}
            />
          )}

          <View style={styles.friendDetails}>
            <View style={styles.friendNameContainer}>
              <Text style={styles.friendName}>
                {item.username || item.email.split("@")[0]}
              </Text>
              <View
                style={[
                  styles.statusIndicator,
                  {
                    backgroundColor: isOnline
                      ? Colors.primaryLimo
                      : Colors.disable,
                  },
                ]}
              />
            </View>
            {/* <Text
              style={[
                styles.friendStatus,
                isOnline ? styles.onlineStatus : styles.offlineStatus,
              ]}
            >
              {isOnline ? "Online" : "Offline"}
            </Text> */}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ----- Render Non-Friend Item (with Add Friend button) -----
  const renderNonFriendItem = ({ item }: { item: User }) => {
    const isSelected = selectedFriends.includes(item._id);
    const requestAlreadySent = sentFriendRequests.includes(item._id);
    const isOnline = onlineFriends.includes(item._id);

    return (
      <TouchableOpacity
        style={[styles.friendItem, isSelected && styles.friendItemSelected]}
        onPress={() => toggleFriendSelection(item._id)}
      >
        <View style={styles.friendInfo}>
          {/* Selection component (unchanged) */}
          {gameStyle === "duel" ? (
            <RadioButton
              label=""
              selected={isSelected}
              onChange={() => toggleFriendSelection(item._id)}
            />
          ) : (
            <Checkbox
              label=""
              checked={isSelected}
              onChange={() => toggleFriendSelection(item._id)}
            />
          )}

          <View style={styles.friendDetails}>
            <View style={styles.friendNameContainer}>
              <Text style={styles.friendName}>
                {item.username || item.email.split("@")[0]}
              </Text>
              <View
                style={[
                  styles.statusIndicator,
                  {
                    backgroundColor: isOnline
                      ? Colors.primaryLimo
                      : Colors.disable,
                  },
                ]}
              />
            </View>
            {/* <Text style={[styles.friendStatus, styles.offlineStatus]}>
              {requestAlreadySent ? "Friend request sent" : "Found via search"}
            </Text> */}
          </View>
        </View>

        {/* Only show add button if request not already sent */}
        {!requestAlreadySent && (
          <View style={styles.rightSection}>
            <TouchableOpacity
              onPress={() => handleSendFriendRequest(item._id)}
              disabled={isLoading}
            >
              <IconAddFriend />
            </TouchableOpacity>
          </View>
        )}
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
        onPress={leaveRoom}
        accessibilityLabel="Go back"
      >
        <IconArrowBack />
      </TouchableOpacity>

      <View style={{ marginBottom: Gaps.g24 }}>
        <Logo size="small" />
      </View>

      <Text style={styles.title}>
        {gameStyle === "duel"
          ? "Challenge a Quizzly Bear"
          : "Invite Quizzly Bears"}
      </Text>
      <Text style={styles.subtitle}>Room ID: {roomInfo.roomId}</Text>

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
        {searchState.result && (
          <View style={styles.searchResultContainer}>
            <Text style={styles.searchResultText}>User found and added</Text>
          </View>
        )}
      </View>

      <FlatList
        data={[...nonFriends, ...friends.friends]}
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
        <ButtonPrimary
          text={
            gameStyle === "duel"
              ? `Challenge ${selectedFriends.length} Quizzly Bear${
                  selectedFriends.length !== 1 ? "s" : ""
                }`
              : `Invite ${selectedFriends.length} Quizzly Bear${
                  selectedFriends.length !== 1 ? "s" : ""
                }`
          }
          onPress={handleInviteFriends}
        />
      </View>

      {/* Custom Alert */}
      <CustomAlert
        visible={showNoFriendsAlert}
        onClose={handleNoFriendsAlertClose}
        title="No Quizzly Bear Selected"
        message={
          gameStyle === "duel"
            ? "Please select a Quizzly Bear to challenge"
            : "Please select at least one Quizzly Bear to invite"
        }
        cancelText={null}
        confirmText="OK"
        onConfirm={handleNoFriendsAlertClose}
        noInternet={false}
      />

      <CustomAlert
        visible={showErrorAlert}
        onClose={handleErrorAlertClose}
        title="Error"
        message={errorMessage}
        cancelText={null}
        confirmText="OK"
        onConfirm={handleErrorAlertClose}
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
    paddingHorizontal: Gaps.g24,
  },
  backButton: {
    position: "absolute",
    top: -8,
    left: 16,
    zIndex: 10,
  },
  title: {
    fontSize: FontSizes.H1Fs,
    marginBottom: Gaps.g8,
  },
  subtitle: {
    fontSize: FontSizes.TextMediumFs,
    marginBottom: Gaps.g24,
    color: Colors.black,
  },
  selectionInfo: {
    alignSelf: "flex-start",
    marginBottom: Gaps.g16,
  },
  selectionText: {
    fontSize: FontSizes.TextMediumFs,
  },
  friendsList: {
    flex: 1,
    width: "100%",
  },
  friendItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Gaps.g8,
    paddingHorizontal: Gaps.g8,
    marginBottom: Gaps.g8,
  },
  friendItemSelected: {},
  friendInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: FontSizes.TextMediumFs,
    marginBottom: Gaps.g4,
  },
  friendNameOffline: {
    color: Colors.systemRed,
  },
  friendStatus: {
    fontSize: FontSizes.TextSmallFs,
    color: Colors.darkGreen,
  },
  buttonContainer: {
    width: "100%",
    gap: Gaps.g16,
    paddingBottom: Gaps.g24,
  },
  errorText: {
    fontSize: FontSizes.TextSmallFs,
    color: Colors.systemRed,
  },

  searchContainer: {
    marginBottom: Gaps.g16,
  },
  errorContainer: {
    minHeight: 20,
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
    padding: Gaps.g4,
  },

  nonFriendStatus: {
    color: Colors.systemOrange,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gaps.g8,
  },

  searchResultContainer: {},
  searchResultText: {
    fontSize: FontSizes.TextSmallFs,
    color: Colors.darkGreen,
  },
  searchResultSubtext: {
    fontSize: FontSizes.TextSmallFs,
    color: Colors.darkGreen,
    marginTop: Gaps.g4,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: Gaps.g8,
    alignSelf: "center",
  },
  friendNameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  onlineStatus: {
    color: Colors.darkGreen,
  },
  offlineStatus: {
    color: Colors.systemRed,
  },
});

export default InviteFriendsScreen;
