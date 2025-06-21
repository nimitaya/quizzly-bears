import { Tabs } from "expo-router";
import { Image, ImageBackground, Text, View } from "react-native";

// Reusable Tab Icon Component, needs Props when used below in Layout Component
// =================================
// ======== Just an example ========
// =================================
// To style the tab icons, when focused with a background image
const TabIcon = ({ focused, icon, title }: any) => {
    // If focused, show the background image
  if (focused) {
    return (
      <ImageBackground
        source={"backgroundImage"} // Replace with background image source
      >
        <Image source={icon} tintColor="#151312" className="size-5" />
        <Text >
          {title}
        </Text>
      </ImageBackground>
    );
  }

// If not focused, just show the icon
  return (
    <View >
      <Image source={icon} tintColor="#A8B5DB" className="size-5" />
    </View>
  );
};

// The Layout Component itself for the Tabs 
// =================================
// ======== Just an example ========
// =================================

const _Layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarStyle: {
          backgroundColor: "#0F0D23",
          borderRadius: 50,
          marginHorizontal: 20,
          marginBottom: 50,
          height: 52,
          position: "absolute",
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "#0F0D23"
        },
      }}
    >
      <Tabs.Screen
        name="PlayScreen"
        options={{
          title: "Play",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={"Bear"} title="Play" />
          ),
        }}
      />
      <Tabs.Screen
        name="StatisticsScreen"
        options={{
          title: "Statistics",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={"s"} title="Statistics" />
          ),
        }}
      />
      <Tabs.Screen
        name="ProfileScreen"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={"p"} title="Profile" />
          ),
        }}
      />
    </Tabs>
  )
}
export default _Layout