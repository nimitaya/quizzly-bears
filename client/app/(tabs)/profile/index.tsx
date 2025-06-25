import IconBearTab from "@/assets/icons/IconBearTab";
import IconBearTabAktiv from "@/assets/icons/IconBearTabAktiv";
import { Text, View } from "react-native";
const ProfileScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>ProfileScreen</Text>
      <IconBearTab />
      <IconBearTabAktiv />
    </View>
  );
};
export default ProfileScreen;
