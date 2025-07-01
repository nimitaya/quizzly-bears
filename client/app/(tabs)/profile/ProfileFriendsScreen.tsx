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
import { SearchFriendInput } from "@/components/Inputs";

const ProfilInvitationsScreen = () => {
  const router = useRouter();

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
        <View style={{ marginBottom: Gaps.g16 }}>
          <Logo size="small" />
        </View>

        {/*==== if you don't have friends yet ====*/}
        <View style={styles.searchFriendsBox}>
          <Text style={{ fontSize: FontSizes.H2Fs }}>Friends</Text>
          <SearchFriendInput placeholder="e-mail..." />
          <View style={styles.textBox}>
            <Text style={{ fontSize: FontSizes.TextLargeFs }}>
              Unfortunately, it's empty so far...?
            </Text>
            <Text style={{ fontSize: FontSizes.TextLargeFs }}>
              Invite someone over.
            </Text>
          </View>
        </View>

        {/*==== if you already have friends ====*/}
        {/* CODE HERE */}
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
  searchFriendsBox: {
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    gap: Gaps.g32,
  },
  textBox: {
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
  },
});
