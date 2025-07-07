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
import { useUser } from "@clerk/clerk-expo";
import { useState, useEffect } from "react";
import { acceptInviteRequest, getReceivedInviteRequests } from "@/utilities/invitationApi";
import { InviteRequestsResponse, InviteRequest } from "@/utilities/invitationInterfaces";

const ProfilInvitationsScreen = () => {
  const router = useRouter();
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(false);
  const [receivedInvites, setReceivedInvites] = useState<InviteRequest[]>([]);

  // =========== Functions ===========
  // ----- Handler Accept -----
  const handleAcceptInvitation = async (inviteId: string) => {
    try {
      if (!user) return;
      setIsLoading(true);
      const clerkUserId = user.id;
      await acceptInviteRequest(clerkUserId, inviteId);
      const received = await getReceivedInviteRequests(clerkUserId);
      setReceivedInvites(received.inviteRequests || []);
    } catch (error) {
       console.error("Error accepting invitation:", error);
    } finally{
      setIsLoading(false);
    }
  }

  // ----- Handler Decline -----
  const handleDeclineInvitation = async (inviteId: string) => {
    try {
      if (!user) return;
      setIsLoading(true);
      const clerkUserId = user.id;
    } catch (error) {
      console.error("Error declining invitation:", error);
    } finally {
      setIsLoading(false);
    }
  }


  // =========== useEffect ===========
  useEffect (() => {
    if(!user) return;
    setIsLoading(true);
    // Fetch the received invitations from the API
    const fetchInviteRequests = async () => {
      try {
        const clerkUserId = user.id;
        const response = await getReceivedInviteRequests(clerkUserId);
        setReceivedInvites(response.inviteRequests || []);
      } catch (error) {
        console.error("Error fetching received invitations:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInviteRequests();
  },[user])

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
          receivedInvites.map((invite, index) => (
            // ========== NEEDS STYLING TODO ==========
            <View key={invite._id || index} >
              <Text >
                Game Invitations:
              </Text>
              <Text >
                From: {invite.from.username || invite.from.email}
              </Text>
              <View >
                <ButtonPrimary
                  text="Accept"
                  onPress={() => handleAcceptInvitation(invite._id)}
                />
                <ButtonPrimary
                  text="Decline"
                  onPress={() => {/* TODO: Handle decline */}}
                />
              </View>
            </View>
          ))
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
});
