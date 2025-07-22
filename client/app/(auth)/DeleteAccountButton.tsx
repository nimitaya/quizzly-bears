import React, { useState } from "react";
import CustomAlert from "@/components/CustomAlert";
import { useUser } from "@clerk/clerk-expo";
import { ButtonSecondary } from "@/components/Buttons";
import { useClerk } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSound } from "@/providers/SoundProvider";

type DeleteAccountButtonProps = {
  onDelete?: () => void;
};

const DeleteAccountButton: React.FC<DeleteAccountButtonProps> = ({
  onDelete,
}) => {
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const [reLogIn, setReLogIn] = useState(false);
  const { playSound } = useSound();

  const handleDeleteAccount = () => {
    playSound("click");
    setShowAlert(true);
  };

  const confirmDelete = async () => {
    setIsProcessing(true);
    setShowAlert(false);
    try {
      if (!user) {
        setErrorAlert("No user is signed in.");
        setIsProcessing(false);
        return;
      }
      await user.delete();
      if (onDelete) onDelete();
    } catch (err: any) {
      if (err?.status === 403) {
        setReLogIn(true);
      } else {
        setErrorAlert("Failed to delete account. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };
  const { signOut } = useClerk();
  const handleSignOut = async () => {
    if (isProcessing) return; // Prevent multiple clicks

    setIsProcessing(true);

    try {
      // Clear auth-related flags
      await Promise.all([
        AsyncStorage.removeItem("password_recently_reset"),
        AsyncStorage.removeItem("password_recently_reset_persist"),
        AsyncStorage.removeItem("force_signed_in"),
        AsyncStorage.removeItem("had_password_reset"),
        AsyncStorage.removeItem("auth_token"),
      ]);

      // Sign out from Clerk
      await signOut();
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <ButtonSecondary
        text={isProcessing ? "Deleting..." : "Delete Account"}
        onPress={handleDeleteAccount}
        disabled={isProcessing}
      />
      <CustomAlert
        visible={showAlert}
        onClose={() => setShowAlert(false)}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone."
        cancelText="Cancel"
        confirmText="Delete"
        onConfirm={confirmDelete}
        noInternet={false}
      />
      <CustomAlert
        visible={!!errorAlert}
        onClose={() => setErrorAlert(null)}
        title="Error"
        message={errorAlert || ""}
        cancelText={null}
        confirmText="OK"
        onConfirm={() => setErrorAlert(null)}
        noInternet={false}
      />
      <CustomAlert
        visible={reLogIn}
        onClose={() => setReLogIn(false)}
        title="Re-login Required"
        message="For security, please log in again to delete your account."
        cancelText="Cancel"
        confirmText="Re-login"
        onConfirm={() => {
          setReLogIn(false);
          handleSignOut();
        }}
        noInternet={false}
      />
    </>
  );
};

export default DeleteAccountButton;
