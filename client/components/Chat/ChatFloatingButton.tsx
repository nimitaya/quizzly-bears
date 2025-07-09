import React from "react";
import { TouchableOpacity, StyleSheet, View, Text } from "react-native";
import { Colors, FontSizes, Gaps } from "@/styles/theme";
import IconChat from "@/assets/icons/IconChat";

interface ChatFloatingButtonProps {
  onPress: () => void;
  unreadCount?: number;
  isVisible?: boolean;
}

const ChatFloatingButton: React.FC<ChatFloatingButtonProps> = ({
  onPress,
  unreadCount = 0,
  isVisible = true,
}) => {
  if (!isVisible) return null;

  return (
    <TouchableOpacity style={styles.floatingButton} onPress={onPress}>
      <View style={styles.buttonContent}>
        <IconChat width={46} height={46} />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? "99+" : unreadCount.toString()}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    // borderRadius: 28,
    //backgroundColor: Colors.primaryLimo,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    zIndex: 1000,
  },
  buttonContent: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  // Commented out since we're using IconChat component now
  // chatIcon: {
  //   fontSize: 24,
  // },
  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: Colors.systemRed,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default ChatFloatingButton;
