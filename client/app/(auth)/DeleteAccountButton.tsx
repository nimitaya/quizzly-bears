import React, { useState } from "react";
import CustomAlert from "@/components/CustomAlert";
import { useUser } from "@clerk/clerk-expo";
import { ButtonSecondary } from "@/components/Buttons";

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

  const handleDeleteAccount = () => {
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
    } catch (err) {
      setErrorAlert("Failed to delete account. Please try again.");
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
    </>
  );
};

export default DeleteAccountButton;
