import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons";
import { Logo } from "@/components/Logos";
import IconArrowBack from "@/assets/icons/IconArrowBack";
import { FontSizes, Gaps } from "@/styles/theme";
import { loadCacheData, CACHE_KEY } from "@/utilities/cacheUtils";

interface Friend {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
}

interface RoomInfo {
  roomId: string;
  room: any;
  isHost: boolean;
  isAdmin: boolean;
}

const InviteFriendsScreen = () => {
  const router = useRouter();
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    loadRoomInfo();
    loadFriendsList();
  }, []);

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

  // Mock friends list - in real app this would come from your friends API
  const loadFriendsList = () => {
    const mockFriends: Friend[] = [
      { id: "1", name: "Alice Johnson", isOnline: true },
      { id: "2", name: "Bob Smith", isOnline: false },
      { id: "3", name: "Charlie Brown", isOnline: true },
      { id: "4", name: "Diana Prince", isOnline: true },
      { id: "5", name: "Eva Martinez", isOnline: false },
      { id: "6", name: "Frank Wilson", isOnline: true },
    ];
    setFriends(mockFriends);
  };

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends((prev) => {
      if (prev.includes(friendId)) {
        return prev.filter((id) => id !== friendId);
      } else {
        return [...prev, friendId];
      }
    });
  };

  const handleInviteFriends = () => {
    if (selectedFriends.length === 0) {
      Alert.alert(
        "No Friends Selected",
        "Please select at least one friend to invite."
      );
      return;
    }

    // TODO: Send invitations to selected friends
    // For now, we'll just show an alert and proceed to lobby
    const selectedFriendNames = friends
      .filter((friend) => selectedFriends.includes(friend.id))
      .map((friend) => friend.name)
      .join(", ");

    Alert.alert(
      "Invitations Sent",
      `Invitations sent to: ${selectedFriendNames}`,
      [
        {
          text: "Go to Lobby",
          onPress: () => router.push("/(tabs)/play/MultiplayerLobby"),
        },
      ]
    );
  };

  const renderFriendItem = ({ item }: { item: Friend }) => {
    const isSelected = selectedFriends.includes(item.id);

    return (
      <TouchableOpacity
        style={[styles.friendItem, isSelected && styles.friendItemSelected]}
        onPress={() => toggleFriendSelection(item.id)}
        disabled={!item.isOnline}
      >
        <View style={styles.friendInfo}>
          <View style={[styles.avatar, !item.isOnline && styles.avatarOffline]}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </View>
          <View style={styles.friendDetails}>
            <Text
              style={[
                styles.friendName,
                !item.isOnline && styles.friendNameOffline,
              ]}
            >
              {item.name}
            </Text>
            <Text style={styles.friendStatus}>
              {item.isOnline ? "Online" : "Offline"}
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

      <Text style={styles.title}>Invite Friends</Text>
      <Text style={styles.subtitle}>Room ID: {roomInfo.roomId}</Text>

      <View style={styles.selectionInfo}>
        <Text style={styles.selectionText}>
          Selected: {selectedFriends.length} friends
        </Text>
      </View>

      <FlatList
        data={friends}
        renderItem={renderFriendItem}
        keyExtractor={(item) => item.id}
        style={styles.friendsList}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.buttonContainer}>
        <ButtonSecondary
          text="Skip & Continue"
          onPress={() => router.push("/(tabs)/play/MultiplayerLobby")}
        />
        <ButtonPrimary
          text={`Invite ${selectedFriends.length} Friends`}
          onPress={handleInviteFriends}
        />
      </View>
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
});

export default InviteFriendsScreen;
