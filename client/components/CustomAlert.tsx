import { Colors, FontSizes, Gaps, Radius } from "@/styles/theme";
import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { Logo } from "./Logos";

type CustomAlertProps = {
  visible: boolean;
  onClose: () => void;
  title?: string | null;
  message: string;
  cancelText?: string | null;
  confirmText?: string;
  onConfirm?: () => void;
  noInternet: boolean;
};

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  onClose,
  title,
  message,
  cancelText = "Cancel",
  confirmText = "OK",
  onConfirm = onClose,
  noInternet,
}) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.alertBox}>
        {noInternet ? <Logo size="small" /> : null}
        <Text style={styles.message}>{message}</Text>
        <View style={styles.buttonRow}>
          {cancelText !== null && (
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.okBtn} onPress={onConfirm}>
            <Text style={styles.okText}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(41, 45, 26, 0.58)",
  },
  alertBox: {
    backgroundColor: Colors.bgGray,
    borderRadius: 28,
    padding: 32,
    width: 320,
    alignItems: "center",
  },
  message: {
    fontSize: FontSizes.H3Fs,
    textAlign: "center",
    marginTop: Gaps.g24,
    width: 256,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: Gaps.g40,
  },
  cancelBtn: {
    width: 120,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: Radius.r50,
  },
  okBtn: {
    width: 120,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primaryLimo,
    borderRadius: Radius.r50,
  },
  cancelText: {
    color: Colors.black,
    textAlign: "center",
    fontSize: FontSizes.TextSmallFs,
  },
  okText: {
    color: Colors.black,
    textAlign: "center",
    fontSize: FontSizes.TextSmallFs,
  },
});

export default CustomAlert;
