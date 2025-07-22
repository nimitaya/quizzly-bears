import { Tabs, router } from "expo-router";
import { View, StyleSheet } from "react-native";
import React, { useContext, useEffect } from "react";
import IconBearTab from "@/assets/icons/IconBearTab";
import IconBearTabAktiv from "@/assets/icons/IconBearTabAktiv";
import IconStatisticsTab from "@/assets/icons/IconStatisticsTab";
import IconStatisticsTabAktiv from "@/assets/icons/IconStatisticsTabAktiv";
import IconProfilTab from "@/assets/icons/IconProfilTab";
import IconProfilTabAktiv from "@/assets/icons/IconProfilTabAktiv";
import { Colors, Gaps } from "@/styles/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UserContext } from "@/providers/UserProvider";
import { getReceivedFriendRequests } from "@/utilities/friendRequestApi";
import { getReceivedInviteRequests } from "@/utilities/invitationApi";
import socketService from "@/utilities/socketService";

const TabIcon = ({ focused, Icon, ActiveIcon, title }: any) => (
  <View style={{ alignItems: "center" }}>
    {focused ? <ActiveIcon /> : <Icon />}
  </View>
);

const _Layout = () => {
  const insets = useSafeAreaInsets();
  const {
    userData,
    receivedRequestsCount,
    setReceivedRequestsCount,
    setReceivedInviteRequests,
    receivedInviteRequests,
  } = useContext(UserContext);

  useEffect(() => {
    if (userData) {
      const handleFriendRequestSent = (data: any) => {
        getReceivedFriendRequests(userData.clerkUserId).then((received) => {
          setReceivedRequestsCount(received.friendRequests.length);
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
          .catch((error) => {});
      };

      // Set up reconnection handler
      const handleReconnect = () => {
        if (userData?.clerkUserId) {
          // Refresh friend request count
          getReceivedFriendRequests(userData.clerkUserId)
            .then((received) => {
              const pendingRequests = received.friendRequests.filter(
                (req) => req.status === "pending"
              );
              setReceivedRequestsCount(pendingRequests.length);
            })
            .catch((err) => {});

          // Refresh invitation count
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
            .catch((err) => {});
        }
      };

      socketService.on("friendRequestSent", handleFriendRequestSent);
      socketService.on("friendRequestAccepted", handleFriendRequestSent);
      socketService.on("friendRequestDeclined", handleFriendRequestSent);
      socketService.on("inviteRequestSent", handleInviteRequestSent);
      socketService.on("inviteRequestAccepted", handleInviteRequestSent);
      socketService.on("inviteRequestDeclined", handleInviteRequestSent);
      socketService.on("connect", handleReconnect);

      return () => {
        socketService.off("friendRequestSent", handleFriendRequestSent);
        socketService.off("friendRequestAccepted", handleFriendRequestSent);
        socketService.off("friendRequestDeclined", handleFriendRequestSent);
        socketService.off("inviteRequestSent", handleInviteRequestSent);
        socketService.off("inviteRequestAccepted", handleInviteRequestSent);
        socketService.off("inviteRequestDeclined", handleInviteRequestSent);
        socketService.off("connect", handleReconnect);
      };
    }
  }, [userData]);

  useEffect(() => {
    if (!userData?.clerkUserId) return;

    // Load friend request count
    getReceivedFriendRequests(userData.clerkUserId)
      .then((received) => {
        const pendingRequests = received.friendRequests.filter(
          (req) => req.status === "pending"
        );
        setReceivedRequestsCount(pendingRequests.length);
      })
      .catch(() => {});

    // Load invitation count
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
      .catch((err) => console.error("Error loading invitations:", err));
  }, [userData?.clerkUserId]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bgGray }}>
      <View />
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: Colors.bgGray,
            borderTopWidth: 1,
            borderTopColor: Colors.darkGreen,
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: Gaps.g16,
          },
        }}
      >
        <Tabs.Screen
          name="statistics"
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              router.navigate("/(tabs)/statistics");
            },
          }}
          options={{
            title: "Statistics",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                Icon={IconStatisticsTab}
                ActiveIcon={IconStatisticsTabAktiv}
                title="Statistics"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="play"
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              router.navigate("/(tabs)/play");
            },
          }}
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                Icon={IconBearTab}
                ActiveIcon={IconBearTabAktiv}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              router.navigate("/(tabs)/profile");
            },
          }}
          options={{
            title: "Profile",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <View style={styles.tabIconContainer}>
                <TabIcon
                  focused={focused}
                  Icon={IconProfilTab}
                  ActiveIcon={IconProfilTabAktiv}
                  title="Profile"
                />

                {(receivedRequestsCount ?? 0) + (receivedInviteRequests ?? 0) >
                  0 && <View style={styles.tabNotificationBadge} />}
              </View>
            ),
          }}
        />
      </Tabs>
    </View>
  );
};

const styles = StyleSheet.create({
  tabIconContainer: {
    position: "relative",
    alignItems: "center",
  },
  tabNotificationBadge: {
    position: "absolute",
    top: 6,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: Gaps.g4,
    backgroundColor: Colors.systemRed,
  },
});

export default _Layout;
