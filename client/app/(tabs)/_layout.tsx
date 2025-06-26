import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import IconBearTab from "@/assets/icons/IconBearTab";
import IconBearTabAktiv from "@/assets/icons/IconBearTabAktiv";
import IconStatisticsTab from "@/assets/icons/IconStatisticsTab";
import IconStatisticsTabAktiv from "@/assets/icons/IconStatisticsTabAktiv";
import IconProfilTab from "@/assets/icons/IconProfilTab";
import IconProfilTabAktiv from "@/assets/icons/IconProfilTabAktiv";
import { Colors } from "@/styles/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TabIcon = ({ focused, Icon, ActiveIcon, title }: any) => (
  <View style={{ alignItems: "center" }}>
    {focused ? <ActiveIcon /> : <Icon />}
  </View>
);

const _Layout = () => {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: Colors.bgGray }}>
      <View
        style={{ height: 4, backgroundColor: Colors.darkGreen, width: "100%" }}
      />
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: Colors.bgGray,
            borderTopWidth: 1,
            borderTopColor: Colors.darkGreen,
            elevation: 0,
            shadowOpacity: 0,
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
              <TabIcon
                focused={focused}
                Icon={IconProfilTab}
                ActiveIcon={IconProfilTabAktiv}
                title="Profile"
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
};

export default _Layout;
