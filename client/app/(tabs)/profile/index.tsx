import IconBearTab from "@/assets/icons/IconBearTab";
import IconBearTabAktiv from "@/assets/icons/IconBearTabAktiv";
import { Text, View } from "react-native";
import ClerlSettings from "@/app/(settings)/ClerkSettings";
import QuizComponent from "@/components/QuizComponent";
const ProfileScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>ProfileScreen</Text>
      <IconBearTab />
      <IconBearTabAktiv />
      <ClerlSettings />
      <QuizComponent/>
    </View>
  );
};
export default ProfileScreen;
