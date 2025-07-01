import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  ScrollView,
  Animated,
} from "react-native";
import IconArrowBack from "@/assets/icons/IconArrowBack";
import { Logo } from "@/components/Logos";
import { FontSizes, Gaps, Colors } from "@/styles/theme";
import { useRouter } from "expo-router";
import { useState, useRef } from "react";
import { ButtonPrimary } from "@/components/Buttons";

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
        <View style={{ marginBottom: Gaps.g40 }}>
          <Logo size="big" />
        </View>

        {/*==== if there are no invitations yet ====*/}
        <View style={styles.textBox}>
          <Text style={{ fontSize: FontSizes.H3Fs }}>
            No invitations right now.
          </Text>
          <Text style={{ fontSize: FontSizes.H3Fs }}>
            You can start a game yourself!
          </Text>
          <ButtonPrimary
            text="Play"
            onPress={() => router.push("../play/QuizTypeSelectionScreen")}
            style={{ marginTop: Gaps.g40 }}
          />
        </View>

        {/*==== if the invitations are availablet ====*/}
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
  textBox: {
    alignItems: "center",
    gap: Gaps.g4,
  },
});
