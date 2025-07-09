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
    allRequests,
    setAllRequests,
  } = useContext(UserContext);

  const socket = io(process.env.EXPO_PUBLIC_SOCKET_URL);

  useEffect(() => {
    if (!userData) return;

    const handleFriendRequestSent = async (data: any) => {
      console.log("Friend request sent:", data);

      try {
        const received = await getReceivedFriendRequests(userData.clerkUserId);
        const receivedCount = received.friendRequests.length;

        setReceivedRequestsCount(receivedCount);
        if (setAllRequests) {
          setAllRequests(receivedCount);
        }

        console.log("✅ Updated received count:", receivedCount);
      } catch (error) {
        console.error("❌ Error fetching received requests:", error);
      }
    };

    socket.on("friendRequestSent", handleFriendRequestSent);
    socket.on("friendRequestAccepted", handleFriendRequestSent);
    socket.on("friendRequestDeclined", handleFriendRequestSent);

    return () => {
      socket.off("friendRequestSent", handleFriendRequestSent);
      socket.off("friendRequestAccepted", handleFriendRequestSent);
      socket.off("friendRequestDeclined", handleFriendRequestSent);
    };
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
                {(allRequests ?? 0) > 0 && (
                  <View style={styles.tabNotificationBadge} />
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
