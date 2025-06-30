import { View, StyleSheet, Text, ScrollView } from "react-native";
import ClerkSettings, {
  ClerkSettingsRefType,
} from "@/app/(auth)/ClerkSettings";
import { useFocusEffect } from "expo-router";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { FontSizes, Gaps } from "@/styles/theme";
import { useGlobalLoading } from "@/providers/GlobalLoadingProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loading from "@/app/Loading";
import { Logo } from "@/components/Logos";
import { useUser } from "@clerk/clerk-expo";
import { Toggle } from "@/components/Toggle";
import { ButtonSecondary } from "@/components/Buttons";
import { useRouter } from "expo-router";

const ProfileScreen = () => {
  const router = useRouter();
  const { isAuthenticated, refreshGlobalState, isGloballyLoading } =
    useGlobalLoading();

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

      <View style={styles.toggleBox}>
        <Toggle label="Sound" />
        <Toggle label="Music" />
        <Text
          style={{
            fontSize: FontSizes.H3Fs,
            paddingHorizontal: Gaps.g32,
          }}
        >
          Language !!!! create
        </Text>
      </View>
      <View style={styles.buttonsBox}>
        <ButtonSecondary text="Invitations" />
        <ButtonSecondary text="Friends" />
        <ButtonSecondary
          text="Account"
          onPress={() => router.push("/(tabs)/profile/AccountScreen")}
        />
        <ButtonSecondary
          text="FAQ"
          onPress={() => router.push("/(tabs)/profile/FaqScreen")}
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
