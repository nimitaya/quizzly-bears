import { View, StyleSheet, ScrollView } from "react-native";
import { ClerkSettingsRefType } from "@/app/(auth)/ClerkSettings";
import { useFocusEffect } from "expo-router";
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import { Gaps } from "@/styles/theme";
import { useGlobalLoading } from "@/providers/GlobalLoadingProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loading from "@/app/Loading";
import { Logo } from "@/components/Logos";
import { Toggle } from "@/components/Toggle";
import { ButtonSecondary, ButtonSecondaryDisabled } from "@/components/Buttons";
import { useRouter } from "expo-router";
import GreetingsScreen from "./GreetngsScreen";
import { useMusic } from "@/providers/MusicProvider";
import { useSound } from "@/providers/SoundProvider";
import { useUser } from "@clerk/clerk-expo";
import LanguageDropdown from "@/app/(tabs)/profile/LanguageDropdown";
import { useLanguage } from "@/providers/LanguageContext";
import { UserContext } from "@/providers/UserProvider";
import { getReceivedFriendRequests } from "@/utilities/friendRequestApi";
import { getReceivedInviteRequests } from "@/utilities/invitationApi";
import socketService from "@/utilities/socketService";

const ProfileScreen = () => {
  const router = useRouter();
  const { isAuthenticated, refreshGlobalState, isGloballyLoading } =
    useGlobalLoading();
  const { changeLanguage } = useLanguage();
  const isMounted = useRef(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const hasFocusedRef = useRef(false);
  const clerkSettingsRef = useRef<ClerkSettingsRefType>(null);
  const [passwordResetFlag, setPasswordResetFlag] = useState<string | null>(
    null
  );

  const { musicEnabled, toggleMusic } = useMusic();
  const { soundEnabled, toggleSound } = useSound();
  const { user } = useUser();
  const {
    userData,
    receivedRequestsCount,
    setReceivedRequestsCount,
    receivedInviteRequests,
    setReceivedInviteRequests,
  } = useContext(UserContext);

  //Funktion to handle language change
  const handleLanguageChange = async (language: any) => {
    await changeLanguage(language);
  };

  // Check for password reset flag on mount and refresh
  useEffect(() => {
    let isMounted = true;

    const checkPasswordResetFlag = async () => {
      try {
        const resetFlag = await AsyncStorage.getItem("password_recently_reset");
        if (isMounted) {
          setPasswordResetFlag(resetFlag);
        }
      } catch (err) {}
    };

    checkPasswordResetFlag();
    return () => {
      isMounted = false;
    };
  }, [refreshKey, receivedRequestsCount]);

  // IMPORTANT: Trigger manual refresh via ref when auth state changes
  useEffect(() => {
    if (!isMounted.current || !clerkSettingsRef.current) return;

    const timer = setTimeout(() => {
      if (isMounted.current && clerkSettingsRef.current?.manualRefresh) {
        clerkSettingsRef.current.manualRefresh();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [refreshKey, passwordResetFlag, isAuthenticated]);

  // Track mounted state and save last screen
  useEffect(() => {
    isMounted.current = true;
    AsyncStorage.setItem("last_screen", "/(tabs)/profile");
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Store refreshGlobalState in a ref to avoid dependency loops
  const refreshGlobalStateRef = useRef(refreshGlobalState);
  useEffect(() => {
    refreshGlobalStateRef.current = refreshGlobalState;
  }, [refreshGlobalState]);

  // IMPORTANT: Reset focus flag after timeout to allow future refreshes when tab is revisited
  useEffect(() => {
    if (hasFocusedRef.current) {
      const timer = setTimeout(() => {
        hasFocusedRef.current = false;
      }, 1000);
      return () => clearTimeout(timer);
    }
  });

  // CRITICAL: Handle tab focus and password reset detection
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(async () => {
        if (hasFocusedRef.current) return;

        hasFocusedRef.current = true;

        if (isMounted.current) {
          try {
            // IMPORTANT: Special handling for password reset flag
            const resetFlag = await AsyncStorage.getItem(
              "password_recently_reset"
            );
            if (resetFlag === "true") {
              await AsyncStorage.setItem(
                "password_recently_reset_persist",
                "true"
              );
              setTimeout(async () => {
                try {
                  await AsyncStorage.removeItem("password_recently_reset");
                } catch {}
              }, 2000);
            }

            setRefreshKey((prev) => prev + 1);
          } catch (err) {}
        }
      }, 100);

      // refresh counts when tab is focused
      if (userData?.clerkUserId) {
        getReceivedFriendRequests(userData.clerkUserId).then((received) => {
          const pendingRequests = received.friendRequests.filter(
            (request) => request.status === "pending"
          );
          setReceivedRequestsCount(pendingRequests.length);
        });
      }

      //  refresh invitation counts when tab is focused
      if (userData?.clerkUserId) {
        getReceivedInviteRequests(userData.clerkUserId)
          .then((response) => {
            if (!response?.inviteRequests) return;

            const pendingInvites = response.inviteRequests.filter(
              (invite) => invite.status === "pending"
            );

            if (typeof setReceivedInviteRequests === "function") {
              setReceivedInviteRequests(pendingInvites.length);
            }
          })
          .catch();
      }

      return () => clearTimeout(timer);
    }, [])
  );
  useEffect(() => {
    if (userData) {
      const handleFriendRequestSent = (data: any) => {
        getReceivedFriendRequests(userData.clerkUserId).then((received) => {
          // Only count PENDING requests
          const pendingRequests = received.friendRequests.filter(
            (request) => request.status === "pending"
          );

          setReceivedRequestsCount(pendingRequests.length);
        });
      };

      const handleInviteRequestSent = (data: any) => {
        if (!userData?.clerkUserId) {
          return;
        }

        getReceivedInviteRequests(userData.clerkUserId)
          .then((response) => {
            if (!response?.inviteRequests) {
              return;
            }

            const allInvites = response.inviteRequests;
            const pendingInvites = allInvites.filter(
              (i) => i.status === "pending"
            );

            if (typeof setReceivedInviteRequests === "function") {
              setReceivedInviteRequests(pendingInvites.length);
            }
          })
          .catch();
      };

      socketService.on("friendRequestSent", handleFriendRequestSent);
      socketService.on("friendRequestAccepted", handleFriendRequestSent);
      socketService.on("friendRequestDeclined", handleFriendRequestSent);
      socketService.on("inviteRequestSent", handleInviteRequestSent);
      socketService.on("inviteRequestAccepted", handleInviteRequestSent);
      socketService.on("inviteRequestDeclined", handleInviteRequestSent);

      return () => {
        socketService.off("friendRequestSent", handleFriendRequestSent);
        socketService.off("friendRequestAccepted", handleFriendRequestSent);
        socketService.off("friendRequestDeclined", handleFriendRequestSent);
        socketService.off("inviteRequestSent", handleInviteRequestSent);
        socketService.off("inviteRequestAccepted", handleInviteRequestSent);
        socketService.off("inviteRequestDeclined", handleInviteRequestSent);
      };
    }
  }, [userData]);

  // initial counts
  useEffect(() => {
    if (!userData?.clerkUserId) return;

    // Load initial friend request count
    getReceivedFriendRequests(userData.clerkUserId)
      .then((received) => {
        if (!received?.friendRequests) {
          return;
        }

        const pendingRequests = received.friendRequests.filter(
          (request) => request.status === "pending"
        );

        setReceivedRequestsCount(pendingRequests.length);
      })
      .catch();

    getReceivedInviteRequests(userData.clerkUserId)
      .then((response) => {
        if (!response?.inviteRequests) {
          return;
        }

        const pendingInvites = response.inviteRequests.filter(
          (invite) => invite.status === "pending"
        );

        if (typeof setReceivedInviteRequests === "function") {
          setReceivedInviteRequests(pendingInvites.length);
        }
      })
      .catch((error) => {});
  }, [userData?.clerkUserId]);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={{ marginBottom: Gaps.g24 }}>
        <Logo size="small" />
      </View>
      <View style={styles.greetingsContainer}>
        {isGloballyLoading ? (
          <Loading />
        ) : (
          <GreetingsScreen ref={clerkSettingsRef} refreshKey={refreshKey} />
        )}
      </View>
      <View style={styles.toggleBox}>
        <Toggle label="Sound" onToggle={toggleSound} enabled={soundEnabled} />
        <Toggle label="Music" enabled={musicEnabled} onToggle={toggleMusic} />
        <LanguageDropdown onLanguageChange={handleLanguageChange} />
      </View>
      <View style={styles.buttonsBox}>
        <ButtonSecondary
          text="Invitations"
          showBadge={(receivedInviteRequests ?? 0) > 0}
          onPress={() => router.push("/profile/ProfileInvitationsScreen")}
        />
        {user ? (
          <ButtonSecondary
            text="Friends"
            showBadge={(receivedRequestsCount ?? 0) > 0}
            onPress={() => router.push("/profile/ProfileFriendsScreen")}
          />
        ) : (
          <ButtonSecondaryDisabled text="Friends" />
        )}

        <ButtonSecondary
          text="Account"
          onPress={() => router.push("/profile/AccountScreen")}
        />
        <ButtonSecondary
          text="FAQ"
          onPress={() => {
            router.push("/profile/FaqScreen");
          }}
        />
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Gaps.g80,
    maxWidth: 440,
    alignSelf: "center",
  },
  contentContainer: {
    alignItems: "center",
    paddingBottom: Gaps.g24,
    width: "100%",
    maxWidth: "100%",
  },
  greetingsContainer: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: Gaps.g16,
  },
  toggleBox: {
    gap: Gaps.g8,
    width: "100%",
    alignSelf: "stretch",
    flexDirection: "column",
    alignItems: "stretch",
  },
  buttonsBox: {
    marginTop: Gaps.g40,
    gap: Gaps.g16,
  },
});
