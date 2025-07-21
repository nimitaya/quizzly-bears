import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import { Colors, FontSizes, Gaps } from "@/styles/theme";
import IconClose from "@/assets/icons/IconClose";
import IconSend from "@/assets/icons/IconSend";
import { ChatMessage } from "@/providers/ChatProvider";

interface ChatWindowProps {
  isVisible: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onTyping: (isTyping: boolean) => void;
  typingUsers: string[];
  currentUserId: string;
}

const { height: screenHeight } = Dimensions.get("window");
const CHAT_HEIGHT = screenHeight * 0.65; // 65% of screen height

const ChatWindow: React.FC<ChatWindowProps> = ({
  isVisible,
  onClose,
  messages,
  onSendMessage,
  onTyping,
  typingUsers,
  currentUserId,
}) => {
  const [inputText, setInputText] = useState("");
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const slideAnim = useRef(new Animated.Value(CHAT_HEIGHT)).current;

  // Debug logs
  useEffect(() => {
    console.log("ChatWindow mounted with visible:", isVisible);
    console.log(`Messages count in window: ${messages.length}`);
  }, []);

  useEffect(() => {
    console.log("ChatWindow visibility changed to:", isVisible);
  }, [isVisible]);

  useEffect(() => {
    console.log("Messages updated in ChatWindow:", messages.length);
  }, [messages]);

  // Add inside your ChatWindow component:
  useEffect(() => {
    console.log("ChatWindow received messages:", messages);
    console.log("Messages length:", messages.length);

    if (messages.length === 0) {
      console.log("No messages to display");
    }
  }, [messages]);

  // Handle visibility animation
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 0 : CHAT_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages]);

  // Handle text input changes
  const handleTextChange = (text: string) => {
    setInputText(text);

    // Update typing status
    if (text.length > 0) {
      onTyping(true);

      // Clear existing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      // Set new timeout
      const timeout = setTimeout(() => {
        onTyping(false);
      }, 2000);

      setTypingTimeout(timeout);
    } else {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      onTyping(false);
    }
  };

  // Send message
  const handleSend = () => {
    if (inputText.trim().length === 0) return;

    onSendMessage(inputText);
    setInputText("");

    // Clear typing status
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    onTyping(false);
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Render a message
  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwnMessage = item.playerId === currentUserId;

    // Show only the part of the email before '@' if playerName looks like an email
    const displayName =
      !isOwnMessage && item.playerName && item.playerName.includes("@")
        ? item.playerName.split("@")[0]
        : item.playerName;

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage
            ? styles.ownMessageContainer
            : styles.otherMessageContainer,
        ]}
      >
        {!isOwnMessage && (
          <Text style={styles.messageSender}>{displayName}</Text>
        )}

        <View
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
          ]}
        >
          <Text style={styles.messageText}>{item.message}</Text>
        </View>

        <Text style={styles.messageTime}>
          {formatTime(new Date(item.timestamp))}
        </Text>
      </View>
    );
  };

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat Room 1234</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <IconClose width={24} height={24} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubText}>
                Be the first to say something!
              </Text>
            </View>
          }
        />

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <View style={styles.typingContainer}>
            <Text style={styles.typingText}>
              {typingUsers
                .map((name) =>
                  name && name.includes("@") ? name.split("@")[0] : name
                )
                .join(", ")}{" "}
              {typingUsers.length === 1 ? "is" : "are"} typing...
            </Text>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="type a message..."
            placeholderTextColor={Colors.disable}
            value={inputText}
            onChangeText={handleTextChange}
            multiline
            maxLength={500}
            blurOnSubmit={true}
            onSubmitEditing={() => {
              if (inputText.trim().length > 0) handleSend();
            }}
            returnKeyType="send"
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim().length === 0 && styles.disabledSendButton,
            ]}
            onPress={handleSend}
            disabled={inputText.trim().length === 0}
          >
            <IconSend width={24} height={24} color={Colors.black} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: CHAT_HEIGHT,
    backgroundColor: Colors.white,
    borderTopLeftRadius: Gaps.g40,
    borderTopRightRadius: Gaps.g40,
    zIndex: 1000,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Gaps.g16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bgGray,
  },
  headerTitle: {
    fontSize: FontSizes.TextLargeFs,
  },
  closeButton: {
    padding: Gaps.g4,
  },
  content: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: Gaps.g16,
    paddingBottom: Gaps.g16,
  },
  messageContainer: {
    marginBottom: Gaps.g16,
    maxWidth: "80%",
  },
  ownMessageContainer: {
    alignSelf: "flex-end",
  },
  otherMessageContainer: {
    alignSelf: "flex-start",
  },
  messageSender: {
    fontSize: FontSizes.TextSmallFs,
    marginBottom: Gaps.g4,
  },
  messageBubble: {
    borderRadius: Gaps.g16,
    paddingVertical: Gaps.g8,
    paddingHorizontal: Gaps.g16,
    maxWidth: "100%",
  },
  ownMessageBubble: {
    backgroundColor: Colors.primaryLimo,
  },
  otherMessageBubble: {
    backgroundColor: Colors.bgGray,
  },
  messageText: {
    fontSize: FontSizes.TextMediumFs,
  },
  messageTime: {
    fontSize: FontSizes.CaptionFS,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Gaps.g16,
    borderTopWidth: 1,
    borderTopColor: Colors.bgGray,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.bgGray,
    borderRadius: Gaps.g16,
    paddingVertical: Gaps.g16,
    paddingHorizontal: Gaps.g16,
    maxHeight: 100,
    textAlignVertical: "center",
  },
  sendButton: {
    marginLeft: Gaps.g8,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledSendButton: {
    opacity: 0.5,
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  typingText: {
    fontSize: FontSizes.CaptionFS,
    color: Colors.black,
  },
  emptyContainer: {
    padding: Gaps.g16,
    alignItems: "center",
  },
  emptyText: {
    fontSize: FontSizes.TextMediumFs,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: FontSizes.TextSmallFs,
    color: Colors.darkGreen,
  },
});

export default ChatWindow;
