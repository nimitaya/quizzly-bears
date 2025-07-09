import { View, StyleSheet, Text, ScrollView } from "react-native";
import ClerkSettings, {
  ClerkSettingsRefType,
} from "@/app/(auth)/ClerkSettings";
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
import { resetOnboarding } from "@/providers/OnboardingProvider";
import LanguageDropdown from "@/app/(tabs)/profile/LanguageDropdown";
import { useLanguage } from "@/providers/LanguageContext";
import { UserContext } from "@/providers/UserProvider";
import { io } from "socket.io-client";
import { getReceivedFriendRequests } from "@/utilities/friendRequestApi";
import { getReceivedInviteRequests } from "@/utilities/invitationApi";

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
  const { playSound } = useSound();
  const { user } = useUser();
  const {
    userData,
    receivedRequestsCount,
    setReceivedRequestsCount,
    receivedInviteRequests,
    setReceivedInviteRequests,
  } = useContext(UserContext);

  const socket = io(process.env.EXPO_PUBLIC_SOCKET_URL);

  // Function to test onboarding
  const handleShowOnboarding = async () => {
    try {
      await resetOnboarding();
      router.push({
        pathname: "/onboarding",
      } as any);
    } catch (error) {
      console.error("Error resetting onboarding:", error);
    }
  };

  //=========Vadim: Funktion to handle language change=========
  const handleLanguageChange = async (language: any) => {
    console.log("Language changed to:", language);
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
          console.log("receivedRequestsCount:", receivedRequestsCount);
        }
      } catch (err) {
        console.log("Error checking password reset flag:", err);
      }
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

        console.log("Profile tab focused - refreshing auth state");
        hasFocusedRef.current = true;

        if (isMounted.current) {
          try {
            // IMPORTANT: Special handling for password reset flag
            const resetFlag = await AsyncStorage.getItem(
              "password_recently_reset"
            );
            if (resetFlag === "true") {
              // Ensure flag persists for ClerkSettings to detect
              await AsyncStorage.setItem(
                "password_recently_reset_persist",
                "true"
              );

              // Delay cleanup to ensure proper detection
              setTimeout(() => {
                AsyncStorage.removeItem("password_recently_reset").catch(
                  (err) =>
                    console.log("Error clearing password reset flag:", err)
                );
              }, 2000);
            }

            // Trigger refresh cascade
            setRefreshKey((prev) => prev + 1);
          } catch (err) {
            console.log("Error in profile tab focus:", err);
          }
        }
      }, 100);

      return () => clearTimeout(timer);
    }, [])
  );
  useEffect(() => {
    if (userData) {
      const handleFriendRequestSent = (data: any) => {
        console.log("Friend request sent:", data);

        getReceivedFriendRequests(userData.clerkUserId).then((received) => {
          setReceivedRequestsCount(received.friendRequests.length);
        });
      };

      const handleInviteRequestSent = (data: any) => {
        console.log("📩 Invite request sent:", data);

        if (!userData?.clerkUserId) {
          console.warn("⚠️ clerkUserId відсутній");
          return;
        }

        getReceivedInviteRequests(userData.clerkUserId)
          .then((response) => {
            if (!response?.inviteRequests) {
              console.warn(
                "⚠️ Немає поля inviteRequests у відповіді:",
                response
              );
              return;
            }

            const allInvites = response.inviteRequests;
            const pendingInvites = allInvites.filter(
              (i) => i.status === "pending"
            );

            console.log("📊 Усього запитів:", allInvites.length);
            console.log("⏳ Pending:", pendingInvites.length);

            if (typeof setReceivedInviteRequests === "function") {
              setReceivedInviteRequests(pendingInvites.length);
              console.log("✅ Оновлено стейт");
            } else {
              console.warn("⚠️ setReceivedInviteRequests не є функцією");
            }
          })
          .catch((error) => {
            console.error("❌ getReceivedInviteRequests помилка:", error);
          });
      };

      socket.on("friendRequestSent", handleFriendRequestSent);
      socket.on("friendRequestAccepted", handleFriendRequestSent);
      socket.on("friendRequestDeclined", handleFriendRequestSent);
      socket.on("inviteRequestSent", handleInviteRequestSent);
      socket.on("inviteRequestAccepted", handleInviteRequestSent);
      socket.on("inviteRequestDeclined", handleInviteRequestSent);

      return () => {
        socket.off("friendRequestSent", handleFriendRequestSent);
        socket.off("friendRequestAccepted", handleFriendRequestSent);
        socket.off("friendRequestDeclined", handleFriendRequestSent);
        socket.off("inviteRequestSent", handleInviteRequestSent);
        socket.off("inviteRequestAccepted", handleInviteRequestSent);
        socket.off("inviteRequestDeclined", handleInviteRequestSent);
      };
    }
  }, [userData]);

  if (isGloballyLoading) {
    return <Loading />;
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={{ marginBottom: Gaps.g24 }}>
        <Logo size="small" />
      </View>
      <GreetingsScreen ref={clerkSettingsRef} refreshKey={refreshKey} />
      <View style={styles.toggleBox}>
        <Toggle label="Sound" onToggle={toggleSound} enabled={soundEnabled} />
        <Toggle label="Music" enabled={musicEnabled} onToggle={toggleMusic} />
        <LanguageDropdown onLanguageChange={handleLanguageChange} />
      </View>
      <View style={styles.buttonsBox}>
        <ButtonSecondary
          text={`Invitations  ${
            (receivedInviteRequests ?? 0) > 0
              ? ` (${receivedInviteRequests ?? 0})`
              : ""
          }`}
          onPress={() => router.push("/profile/ProfileInvitationsScreen")}
        />
        {user ? (
          <ButtonSecondary
            text={`Friends  ${
              (receivedRequestsCount ?? 0) > 0
                ? ` (${receivedRequestsCount ?? 0})`
                : ""
            }`}
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
            playSound("custom");
            router.push("/profile/FaqScreen");
          }}
        />
        <ButtonSecondary
          text="Show Onboarding"
          onPress={handleShowOnboarding}
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
  },
  contentContainer: {
    alignItems: "center",
    paddingBottom: Gaps.g24,
  },
  toggleBox: {
    gap: Gaps.g8,
  },
  buttonsBox: {
    marginTop: Gaps.g40,
    gap: Gaps.g16,
  },
});
