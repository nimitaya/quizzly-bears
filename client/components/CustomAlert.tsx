import { Colors, FontSizes, Gaps, Radius } from "@/styles/theme";
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";

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
  showMiniGamesButton?: boolean;
  onMiniGamesPress?: () => void;
  imageSource?: any;
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
  showMiniGamesButton = false,
  onMiniGamesPress,
  imageSource,
}) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.alertBox}>
        {imageSource && <Image source={imageSource} style={styles.image} />}
        {noInternet ? <Logo size="noconnect" /> : <Logo size="small" />}

        <Text style={styles.message}>{message}</Text>
        <View
          style={[
            styles.buttonRow,
            cancelText === null && styles.buttonRowSingle,
            showMiniGamesButton && styles.buttonRowTriple,
          ]}
        >
          {cancelText !== null && (
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>
          )}
          {showMiniGamesButton && onMiniGamesPress && (
            <TouchableOpacity
              style={styles.miniGamesBtn}
              onPress={onMiniGamesPress}
            >
              <Text style={styles.miniGamesText}>Mini Games</Text>
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
  buttonRowSingle: {
    justifyContent: "flex-end",
  },
  buttonRowTriple: {
    justifyContent: "space-between",
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
    height: 48,
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
  image: {
    width: 120,
    height: 120,
    borderRadius: Radius.r50,
    marginBottom: Gaps.g24,
  },
  miniGamesBtn: {
    width: 120,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primaryLimo,
    borderRadius: Radius.r50,
  },
  miniGamesText: {
    color: Colors.black,
    textAlign: "center",
    fontSize: FontSizes.TextSmallFs,
  },
});

export default CustomAlert;
