import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import {
  ButtonPrimary,
  ButtonSecondary,
  ButtonSmallSecondary,
} from "@/components/Buttons";
import { PasswordInput } from "@/components/Inputs";
import CustomAlert from "@/components/CustomAlert";
import { Colors, Gaps, FontSizes } from "@/styles/theme";

const ChangePassword = () => {
  const { user } = useUser();
  const [showForm, setShowForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChangePassword = async () => {
    setError("");
    setSuccess(false);

    if (!currentPassword || !newPassword || !repeatPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword !== repeatPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setIsProcessing(true);
    try {
      await user?.updatePassword({
        currentPassword,
        newPassword,
      });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setRepeatPassword("");
      setShowForm(false); // Hide form after success
    } catch (err: any) {
      setError(
        err?.errors?.[0]?.message ||
          "Failed to change password. Please check your current password and try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset and hide form on cancel
  const handleCancel = () => {
    setShowForm(false);
    setCurrentPassword("");
    setNewPassword("");
    setRepeatPassword("");
    setError("");
  };

  if (!showForm) {
    return (
      <ButtonSecondary
        text="Change Password"
        onPress={() => setShowForm(true)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>
      <PasswordInput
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="Current password"
      />
      <PasswordInput
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="New password"
      />
      <PasswordInput
        value={repeatPassword}
        onChangeText={setRepeatPassword}
        placeholder="Repeat new password"
      />
      {error !== "" && <Text style={styles.errorText}>{error}</Text>}
      <ButtonPrimary
        text={isProcessing ? "Changing..." : "Change Password"}
        onPress={handleChangePassword}
        disabled={isProcessing}
        style={{ marginTop: Gaps.g16 }}
      />
      <ButtonSmallSecondary
        text="Cancel"
        onPress={handleCancel}
        style={{ marginTop: Gaps.g8 }}
      />
      <CustomAlert
        visible={success}
        onClose={() => setSuccess(false)}
        title="Success"
        message="Your password has been changed."
        cancelText={null}
        confirmText="OK"
        noInternet={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: FontSizes.H1Fs,
    fontWeight: "bold",
    marginBottom: Gaps.g24,
    textAlign: "center",
  },
  errorText: {
    color: Colors.systemRed,
    marginTop: 8,
    marginBottom: 8,
    textAlign: "center",
  },
});

export default ChangePassword;
