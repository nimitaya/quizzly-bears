import { Tabs } from "expo-router";
import { Text, View, StyleSheet } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import IconBearTab from "@/assets/icons/IconBearTab";
import IconBearTabAktiv from "@/assets/icons/IconBearTabAktiv";
import IconStatisticsTab from "@/assets/icons/IconStatisticsTab";
import IconStatisticsTabAktiv from "@/assets/icons/IconStatisticsTabAktiv";
import IconProfilTab from "@/assets/icons/IconProfilTab";
import IconProfilTabAktiv from "@/assets/icons/IconProfilTabAktiv";
import { Colors, Gaps } from "@/styles/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UserContext } from "@/providers/UserProvider";
import { io } from "socket.io-client";
import { getReceivedFriendRequests } from "@/utilities/friendRequestApi";
import { getReceivedInviteRequests } from "@/utilities/invitationApi";

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

  const socket = io(process.env.EXPO_PUBLIC_SOCKET_URL);

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
            elevation: 0,
            boxShadow: "none",
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: 16,
          },
        }}
      >
        <Tabs.Screen
          name="statistics"
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
                  0 && (
 <View style={styles.tabNotificationBadge} /></View>
                )}
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
