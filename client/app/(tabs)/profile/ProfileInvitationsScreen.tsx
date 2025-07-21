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
import { ButtonPrimary, ButtonPrimaryDisabled } from "@/components/Buttons";
import { useUser } from "@clerk/clerk-expo";
import { useState, useEffect, useContext } from "react";
import {
  acceptInviteRequest,
  declineInviteRequest,
  getReceivedInviteRequests,
} from "@/utilities/invitationApi";
import { InviteRequest } from "@/utilities/invitationInterfaces";
import IconAccept from "@/assets/icons/IconAccept";
import IconDismiss from "@/assets/icons/IconDismiss";
import IconPending from "@/assets/icons/IconPending";
import { socketService } from "@/utilities/socketService";
import {
  saveDataToCache,
  CACHE_KEY,
  loadCacheData,
} from "@/utilities/cacheUtils";
import { useLanguage } from "@/providers/LanguageContext";
import { UserContext } from "@/providers/UserProvider";

const ProfilInvitationsScreen = () => {
  const router = useRouter();
  const { user } = useUser();
  const { currentLanguage } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [receivedInvites, setReceivedInvites] = useState<InviteRequest[]>([]);
  const { userData, receivedInviteRequests, setReceivedInviteRequests } =
    useContext(UserContext);

  // =========== Functions ===========
  // ----- Handler Accept -----
  const handleAcceptInvitation = async (inviteId: string, roomcode: string) => {
    try {
      if (!user) return;
      if (!inviteId) {
        console.error("Error: Invite ID is missing");
        return;
      }
      if (isLoading) return; // Prevent multiple simultaneous calls

      setIsLoading(true);
      const clerkUserId = user.id;

      // Accept the invitation on the backend
      await acceptInviteRequest(clerkUserId, inviteId);

      // ADD THIS CODE: Update badge count after accepting
      if (typeof setReceivedInviteRequests === "function") {
        const received = await getReceivedInviteRequests(clerkUserId);
        const pendingInvites = (received.inviteRequests || []).filter(
          (invite) => invite.status === "pending"
        );
        setReceivedInviteRequests(pendingInvites.length);
      }

      // Connect to socket service if not already connected
      if (!socketService.isConnected()) {
        await socketService.connect();
      }

      // Join the room via socket
      const playerName =
        user.username || (user.emailAddresses[0]?.emailAddress?.split("@")[0]) || "Player";
      // Get user's language from context or cache
      let userLanguage = currentLanguage?.code;
      if (!userLanguage) {
        const cachedLanguage = await loadCacheData("selected_language");
        userLanguage = cachedLanguage || "en"; // Default to English
      }
      socketService.joinRoom(roomcode, clerkUserId, playerName, userLanguage);

      // Listen for successful room join
      socketService.onRoomJoined((data) => {
        console.log("Successfully joined room:", data.room);

        // Save room info to cache for MultiplayerLobby to use
        const roomInfo = {
          roomId: roomcode,
          room: data.room,
          isHost: false, // Since we're joining, we're not the host
        };

        saveDataToCache(CACHE_KEY.currentRoom, roomInfo);

        // Navigate to MultiplayerLobby
        router.push("../play/MultiplayerLobby");
      });

      // Handle potential errors
      socketService.onError((error) => {
        console.error("Socket error when joining room:", error);
        setIsLoading(false);
        // TODO: Add user-facing error handling (toast/alert)
      });
    } catch (error) {
      console.error("Error accepting invitation:", error);
      setIsLoading(false);
      // TODO: Add user-facing error handling (toast/alert)
    }
  };

  // ----- Handler Decline -----
  const handleDeclineInvitation = async (inviteId: string) => {
    try {
      if (!user) return;
      if (!inviteId) {
        console.error("Error: Invite ID is missing");
        return;
      }
      if (isLoading) return; // Prevent multiple simultaneous calls

      setIsLoading(true);
      const clerkUserId = user.id;
      await declineInviteRequest(clerkUserId, inviteId);

      // Refresh the invitations list
      const received = await getReceivedInviteRequests(clerkUserId);
      setReceivedInvites(received.inviteRequests || []);

      // Update the global badge count
      if (typeof setReceivedInviteRequests === "function") {
        const pendingInvites = (received.inviteRequests || []).filter(
          (invite) => invite.status === "pending"
        );
        setReceivedInviteRequests(pendingInvites.length);
        console.log("Updated invitation badge count:", pendingInvites.length);
      }
    } catch (error) {
      console.error("Error declining invitation:", error);
      // maybe TODO: Add user-facing error handling (toast/alert)
    } finally {
      setIsLoading(false);
    }
  };

  // =========== useEffect ===========
  useEffect(() => {
    if (!user) return;

    // Fetch the received invitations from the API
    const fetchInviteRequests = async () => {
      try {
        setIsLoading(true);
        const clerkUserId = user.id;
        const response = await getReceivedInviteRequests(clerkUserId);
        setReceivedInvites(response.inviteRequests || []);
      } catch (error) {
        console.error("Error fetching received invitations:", error);
        // Set empty array on error to prevent UI issues
        setReceivedInvites([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInviteRequests();

    // Cleanup socket listeners when component unmounts
    return () => {
      socketService.off("room-joined");
      socketService.off("error");
    };
  }, [user]);

  // =========== TODO add global loading, while loading invitations ===========

  useEffect(() => {
    if (!user || !userData) return;

    const clerkUserId = user.id;

    const fetchAndSetInvites = async () => {
      await fetchInvitations(clerkUserId);
    };

    // Create a named function for registering event handlers
    const registerSocketListeners = () => {
      console.log("🔄 Registering invitation socket listeners");

      // Clean up existing listeners first to avoid duplicates
      socketService.off("inviteRequestSent");
      socketService.off("inviteRequestAccepted");
      socketService.off("inviteRequestDeclined");

      // Register the event handlers
      socketService.on("inviteRequestSent", (data: any) => {
        console.log("📩 Invite request sent:", data);
        fetchAndSetInvites();
      });

      socketService.on("inviteRequestAccepted", (data: any) => {
        console.log("✅ Invite request accepted:", data);
        fetchAndSetInvites();
      });

      socketService.on("inviteRequestDeclined", (data: any) => {
        console.log("❌ Invite request declined:", data);
        fetchAndSetInvites();
      });
    };

    // Initial registration
    registerSocketListeners();

    // Set up listener for reconnection events
    socketService.on("connect", () => {
      console.log("Socket reconnected, re-registering invitation listeners");
      registerSocketListeners();
    });

    // Cleanup on unmount
    return () => {
      console.log("Cleaning up invitation socket listeners");
      socketService.off("inviteRequestSent");
      socketService.off("inviteRequestAccepted");
      socketService.off("inviteRequestDeclined");
      socketService.off("connect"); // Important: Remove the reconnection handler
    };
  }, [user, userData]);

  // Fetch both received and sent invitations
  const fetchInvitations = async (clerkUserId: string) => {
    try {
      console.log("Fetching received and sent invites...");
      const [received] = await Promise.all([
        getReceivedInviteRequests(clerkUserId),
      ]);

      const allInvites = received.inviteRequests || [];
      setReceivedInvites(allInvites);

      // ADD THIS CODE: Update the global badge count
      if (typeof setReceivedInviteRequests === "function") {
        const pendingInvites = allInvites.filter(
          (invite) => invite.status === "pending"
        );
        setReceivedInviteRequests(pendingInvites.length);
        console.log("Updated invitation badge count:", pendingInvites.length);
      }

      console.log("Updated received invites:", allInvites);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      setReceivedInvites([]);

      // Set badge count to 0 on error
      if (typeof setReceivedInviteRequests === "function") {
        setReceivedInviteRequests(0);
      }
    }
  };

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
        <View style={{ marginBottom: Gaps.g40 }}>
          <Logo size="big" />
        </View>

        {receivedInvites.length === 0 ? (
          // if there are no invitations yet
          <View style={styles.textBox}>
            <Text style={{ fontSize: FontSizes.H3Fs }}>
              No invitations right now.
            </Text>
            <Text style={{ fontSize: FontSizes.H3Fs }}>
              You can start a game yourself!
            </Text>
            <ButtonPrimary
              text="Play"
              onPress={() => router.push("../play/QuizTypeSelectionScreen")}
              style={{ marginTop: Gaps.g40 }}
            />
          </View>
        ) : (
          // if there are invitations
          <View style={styles.invitationsContainer}>
            <Text style={styles.invitationsTitle}>Game Invitations:</Text>
            {receivedInvites.map((invite, index) => (
              <View key={invite._id || index} style={styles.inviteRow}>
                <Text style={{ fontSize: FontSizes.TextLargeFs }}>
                  {invite.from.username || invite.from.email}
                </Text>

                <View style={styles.actionButtons}>
                  {isLoading ? (
                    <>
                      {/* Loading spinner here? */}
                      <IconPending />
                    </>
                  ) : (
                    <>
                      <TouchableOpacity
                        onPress={() =>
                          handleAcceptInvitation(invite._id, invite.roomcode)
                        }
                        style={styles.iconButton}
                      >
                        <IconAccept />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeclineInvitation(invite._id)}
                        style={styles.iconButton}
                      >
                        <IconDismiss />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
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
  textBox: {
    alignItems: "center",
    gap: Gaps.g4,
  },
  invitationsContainer: {
    width: "100%",
    paddingHorizontal: Gaps.g32,
  },
  invitationsTitle: {
    fontSize: FontSizes.H3Fs,
    textAlign: "left",
    marginBottom: Gaps.g16,
  },
  iconButton: {
    padding: Gaps.g4,
  },
  actionButtons: {
    flexDirection: "row",
    gap: Gaps.g16,
  },
  inviteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Gaps.g4,
    marginBottom: 1,
    width: "100%",
  },
});
