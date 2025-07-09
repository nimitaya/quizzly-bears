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
import { Colors, FontSizes, Gaps } from "@/styles/theme";
import { loadCacheData, CACHE_KEY } from "@/utilities/cacheUtils";
import CustomAlert from "@/components/CustomAlert";
import {
  searchUserByEmail,
  sendInviteRequest,
  getSentInviteRequests,
} from "@/utilities/invitationApi";
import { getFriends, sendFriendRequest } from "@/utilities/friendRequestApi";
import { FriendsResponse, User } from "@/utilities/friendInterfaces";
import { SearchFriendInput } from "@/components/Inputs";
import IconAddFriend from "@/assets/icons/IconAddFriend";
import { UserContext } from "@/providers/UserProvider";
import { Checkbox } from "@/components/Checkbox";
import { RadioButton } from "@/components/RadioButton";
import { io } from "socket.io-client";
import { InviteRequest } from "@/utilities/invitationInterfaces";

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
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [friends, setFriends] = useState<FriendsResponse>({ friends: [] });
  // New for invites:
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
  const [onlineFriends, setOnlineFriends] = useState<Set<string>>(new Set());
  const socket = io(process.env.EXPO_PUBLIC_SOCKET_URL);

  useEffect(() => {
    const socket = io(process.env.EXPO_PUBLIC_BASE_URL, {
      auth: { clerkUserId: userData?.clerkUserId },
    });

    socket.on("user-online", ({ clerkUserId }) => {
      setOnlineFriends((prev) => new Set(prev).add(clerkUserId));
    });

    socket.on("user-offline", ({ clerkUserId }) => {
      setOnlineFriends((prev) => {
        const updated = new Set(prev);
        updated.delete(clerkUserId);
        return updated;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

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
    console.log("❌ Invite request declined:", data);

    // Fetch updated sent invitations
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
  };

  // =========== UseEffect ==========
  useEffect(() => {
    loadRoomInfo();
    loadGameStyle();
    fetchFriends();
  }, []);

  useEffect(() => {
    // Register socket listener for declined invitations
    socket.on("inviteRequestDeclined", handleInviteDeclined);

    // Cleanup socket listener on unmount
    return () => {
      socket.off("inviteRequestDeclined", handleInviteDeclined);
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

  // ========== Render Functions ==========
  // ----- Render Friend Item ----- TODO check online status
  const renderFriendItem = ({ item }: { item: User }) => {
    const isSelected = selectedFriends.includes(item._id);
    const isOnline = item.clerkUserId
      ? onlineFriends.has(item.clerkUserId)
      : false;
    return (
      <TouchableOpacity
        style={[styles.friendItem, isSelected && styles.friendItemSelected]}
        onPress={() => toggleFriendSelection(item._id)}
        // disabled={!item.isOnline}
      >
        <View style={styles.friendInfo}>
          {/* <View style={[styles.avatar, !item.isOnline && styles.avatarOffline]}> */}
          {/* <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.username?.charAt(0) || item.email.charAt(0)}
            </Text>
          </View> */}

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
            <Text style={styles.friendName}>
              {item.username || item.email.split("@")[0]}
            </Text>
            <Text style={styles.friendStatus}>
              {" "}
              Online/ Offline TODO!
              <Text style={styles.friendStatus}>
                {isOnline ? "Online" : "Offline"}
              </Text>
              {/* {item.isOnline ? "Online" : "Offline"} */}
            </Text>
          </View>
        </View>
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
          {/* <View style={[styles.avatar, styles.nonFriendAvatar]}>
            <Text style={styles.avatarText}>
              {item.username?.charAt(0) || item.email.charAt(0)}
            </Text>
          </View> */}

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
            <Text style={styles.friendName}>
              {item.username || item.email.split("@")[0]}
            </Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          <TouchableOpacity
            onPress={() => handleSendFriendRequest(item._id)}
            disabled={isLoading}
            // style={styles.addFriendButton}
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

      <Text style={styles.title}>
        {gameStyle === "duel"
          ? "Challenge a Quizzly Bear"
          : "Invite Quizzly Bears"}
      </Text>
      <Text style={styles.subtitle}>Room ID: {roomInfo.roomId}</Text>

      {/* <View style={styles.selectionInfo}>
        <Text style={styles.selectionText}>
          Selected: {selectedFriends.length} Quizzly Bears
        </Text>
      </View> */}

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

        {/* Search Result !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/}
        {searchState.result && (
          <View style={styles.searchResultContainer}>
            <Text style={styles.searchResultText}>User found and added</Text>
            {/* <Text style={styles.searchResultSubtext}>
              {friends.friends.some(
                (friend) => friend._id === searchState.result?._id
              )
                ? "Added to your list below"
                : "Added to list below"}
            </Text> */}
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
        {/* Skip & Continue button commented out - not needed
        <ButtonSecondary
          text="Skip & Continue"
          onPress={() => router.push("/(tabs)/play/MultiplayerLobby")}
        />
        */}
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
    padding: Gaps.g8,
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
    fontWeight: "500",
    marginBottom: 2,
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
  // Added styles from ProfileFriendsScreen.tsx
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
    padding: 4,
  },
  // Added by Co-Pilot for non-friend styling

  nonFriendStatus: {
    color: Colors.systemOrange,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  // addFriendButton: {
  //   padding: 8,
  //   backgroundColor: "#f0f0f0",
  //   borderRadius: 8,
  // },
  searchResultContainer: {},
  searchResultText: {
    fontSize: FontSizes.TextSmallFs,
    color: Colors.darkGreen,
  },
  searchResultSubtext: {
    fontSize: FontSizes.TextSmallFs,
    color: Colors.darkGreen,
    marginTop: 4,
  },
});

export default InviteFriendsScreen;
