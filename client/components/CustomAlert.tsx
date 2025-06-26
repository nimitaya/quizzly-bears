import { Colors } from "@/styles/theme";
import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

type CustomAlertProps = {
  visible: boolean;
  onClose: () => void;
  title?: string | null;
  message: string;
  cancelText?: string;
  confirmText?: string;
  onConfirm?: () => void;
};

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  onClose,
  title,
  message,
  cancelText = "Cancel",
  confirmText = "OK",
  onConfirm = onClose,
}) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.alertBox}>
        <Text style={styles.title}>{title}</Text>
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
    backgroundColor: "#0008",
  },
  alertBox: {
    backgroundColor: Colors.bgGray,
    borderRadius: 10,
    padding: 24,
    width: 300,
    alignItems: "center",
  },
  title: { fontWeight: "bold", fontSize: 18, marginBottom: 8 },
  message: { fontSize: 16, marginBottom: 16 },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    padding: 10,
    marginRight: 8,
    backgroundColor: Colors.white,
    borderRadius: 5,
  },
  okBtn: {
    flex: 1,
    padding: 10,
    marginLeft: 8,
    backgroundColor: Colors.primaryLimo,
    borderRadius: 5,
  },
  cancelText: { color: Colors.black, textAlign: "center" },
  okText: { color: Colors.black, textAlign: "center" },
});

export default CustomAlert;
