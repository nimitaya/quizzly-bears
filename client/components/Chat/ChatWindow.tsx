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
import { ChatMessage } from "@/utilities/socketService";

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
const CHAT_HEIGHT = screenHeight * 0.7; // 70% of screen height

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
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const slideAnim = useRef(new Animated.Value(CHAT_HEIGHT)).current;
  const typingTimeoutRef = useRef<number | null>(null);

  // Animate chat window
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 0 : CHAT_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Handle typing indicator
  const handleInputChange = (text: string) => {
    setInputText(text);

    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      onTyping(true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping(false);
    }, 1000);
  };

  const handleSendMessage = () => {
    if (inputText.trim().length === 0) return;

    onSendMessage(inputText.trim());
    setInputText("");

    // Stop typing
    if (isTyping) {
      setIsTyping(false);
      onTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwnMessage = item.playerId === currentUserId;

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        {!isOwnMessage && (
          <Text style={styles.senderName}>{item.playerName}</Text>
        )}
        <Text
          style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
          ]}
        >
          {item.message}
        </Text>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;

    const typingText =
      typingUsers.length === 1
        ? `${typingUsers[0]} is typing...`
        : `${typingUsers.length} users are typing...`;

    return (
      <View style={styles.typingContainer}>
        <Text style={styles.typingText}>{typingText}</Text>
      </View>
    );
  };

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.chatContainer,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chat</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconClose width={24} height={24} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Typing indicator */}
        {renderTypingIndicator()}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={handleInputChange}
            placeholder="Type a message..."
            placeholderTextColor={Colors.disable}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim().length === 0 && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={inputText.trim().length === 0}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  chatContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: CHAT_HEIGHT,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    zIndex: 999,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Gaps.g16,
    paddingVertical: Gaps.g8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bgGray,
  },
  headerTitle: {
    fontSize: FontSizes.H3Fs,
    fontWeight: "bold",
  },
  closeButton: {
    padding: Gaps.g8,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: Gaps.g16,
  },
  messagesContent: {
    paddingVertical: Gaps.g8,
  },
  messageContainer: {
    marginVertical: Gaps.g4,
    maxWidth: "80%",
  },
  ownMessage: {
    alignSelf: "flex-end",
  },
  otherMessage: {
    alignSelf: "flex-start",
  },
  senderName: {
    fontSize: FontSizes.TextSmallFs,
    color: Colors.darkGreen,
    marginBottom: Gaps.g4,
  },
  messageText: {
    padding: Gaps.g8,
    borderRadius: 12,
    fontSize: FontSizes.TextMediumFs,
    lineHeight: 20,
  },
  ownMessageText: {
    backgroundColor: Colors.primaryLimo,
    color: Colors.black,
  },
  otherMessageText: {
    backgroundColor: Colors.bgGray,
    color: Colors.black,
  },
  timestamp: {
    fontSize: FontSizes.TextSmallFs,
    color: Colors.disable,
    marginTop: Gaps.g4,
    textAlign: "right",
  },
  typingContainer: {
    paddingHorizontal: Gaps.g16,
    paddingVertical: Gaps.g8,
    borderTopWidth: 1,
    borderTopColor: Colors.bgGray,
  },
  typingText: {
    fontSize: FontSizes.TextSmallFs,
    color: Colors.disable,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Gaps.g16,
    paddingVertical: Gaps.g8,
    borderTopWidth: 1,
    borderTopColor: Colors.bgGray,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.bgGray,
    borderRadius: 12,
    paddingHorizontal: Gaps.g8,
    paddingVertical: Gaps.g8,
    fontSize: FontSizes.TextMediumFs,
    maxHeight: 100,
    marginRight: Gaps.g8,
  },
  sendButton: {
    backgroundColor: Colors.primaryLimo,
    paddingHorizontal: Gaps.g16,
    paddingVertical: Gaps.g8,
    borderRadius: 12,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.disable,
  },
  sendButtonText: {
    fontSize: FontSizes.TextMediumFs,
  },
});

export default ChatWindow;
