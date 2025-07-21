import React, { createContext, useContext, useState, useEffect } from "react";
import { UserContext } from "@/providers/UserProvider";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getDatabase,
  ref,
  push,
  onValue,
  off,
  set,
  remove,
} from "firebase/database";

export interface ChatMessage {
  id: string;
  roomId: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: Date;
}

interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (message: string) => void;
  typingUsers: string[];
  setTyping: (isTyping: boolean) => void;
  unreadCount: number;
  resetUnreadCount: () => void;
  isChatVisible: boolean;
  toggleChat: () => void;
}

const ChatContext = createContext<ChatContextType>({
  messages: [],
  sendMessage: () => {},
  typingUsers: [],
  setTyping: () => {},
  unreadCount: 0,
  resetUnreadCount: () => {},
  isChatVisible: false,
  toggleChat: () => {},
});

export const useChat = () => useContext(ChatContext);

interface ChatProviderProps {
  children: React.ReactNode;
  roomId?: string; // Make roomId optional, with default in the provider
}

export const ChatProvider: React.FC<ChatProviderProps> = ({
  children,
  roomId = "shared_room1234", // Default room ID if none is provided
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [lastChatOpenTime, setLastChatOpenTime] = useState<Date>(new Date());
  const { userData } = useContext(UserContext);
  const chatRefObject = React.useRef<any>(null);

  // Use the provided roomId instead of a constant
  const CHAT_ROOM_ID = roomId;

  // Initialize Firebase
  useEffect(() => {
    if (!userData) return;

    try {
      const firebaseConfig = {
        apiKey: "AIzaSyAYBg-H2vqklKbIVCWsiU4x42uMrjhWG3A",
        authDomain: "quizzlybears-b110c.firebaseapp.com",
        databaseURL:
          "https://quizzlybears-b110c-default-rtdb.europe-west1.firebasedatabase.app/",
        projectId: "quizzlybears-b110c",
        storageBucket: "quizzlybears-b110c.firebasestorage.app",
        messagingSenderId: "643883383664",
        appId: "1:643883383664:web:5b75cfe8035364c70d2db5",
      };

      let app;
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApp();
      }

      const db = getDatabase(app);
      const chatPath = `chats/${CHAT_ROOM_ID}`; // Use dynamic room ID
      const chatRef = ref(db, chatPath);

      // Add welcome message if no messages exist yet
      onValue(
        chatRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            const welcomeMessage = {
              id: `welcome_${Date.now()}`,
              roomId: CHAT_ROOM_ID,
              playerId: "system",
              playerName: "System",
              message: `Welcome to the room chat!`,
              timestamp: new Date().toISOString(),
            };

            push(chatRef, welcomeMessage);
          }
        },
        { onlyOnce: true }
      );

      chatRefObject.current = chatRef;
    } catch (error) {
      console.error("Firebase initialization error:", error);
    }
  }, [userData, CHAT_ROOM_ID]); // Add CHAT_ROOM_ID as dependency

  // Listen for messages
  useEffect(() => {
    if (!userData || !chatRefObject.current) return;

    const chatRef = chatRefObject.current;

    const unsubscribe = onValue(
      chatRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();

          try {
            // Convert Firebase object to array of messages
            const messageList = Object.keys(data).map((key) => ({
              ...data[key],
              timestamp: new Date(data[key].timestamp),
            }));

            // Sort messages by timestamp
            messageList.sort(
              (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
            );

            // Update messages state
            setMessages(messageList);

            // Check for unread messages if chat is not visible
            if (!isChatVisible) {
              // Only count messages from others after lastChatOpenTime
              const newMessages = messageList.filter(
                (msg) =>
                  msg.playerId !== userData.clerkUserId &&
                  msg.timestamp > lastChatOpenTime
              );

              if (newMessages.length > 0) {
                setUnreadCount(newMessages.length);
              }
            }
          } catch (err) {
            console.error("Error processing messages:", err);
          }
        }
      },
      (error) => {
        console.error("Firebase onValue error:", error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [userData, isChatVisible, lastChatOpenTime]);

  // Send message function
  const sendMessage = (message: string) => {
    if (!userData || !message.trim()) return;

    try {
      const messageData = {
        id: `firebase_${Date.now()}`,
        roomId: CHAT_ROOM_ID,
        playerId: userData.clerkUserId,
        playerName: userData.username || userData.email || "Anonymous",
        message: message.trim(),
        timestamp: new Date(),
      };

      // Update local state immediately for UI feedback
      setMessages((prev) => [...prev, messageData]);

      // Push to Firebase
      const db = getDatabase();
      const chatRef = ref(db, `chats/${CHAT_ROOM_ID}`);

      const firebaseMessage = {
        ...messageData,
        timestamp: messageData.timestamp.toISOString(),
      };

      push(chatRef, firebaseMessage);
    } catch (error) {
      console.error("Error in sendMessage:", error);
    }
  };

  // Set typing status
  const setTyping = (isTyping: boolean) => {
    if (!userData) return;

    try {
      const playerName = userData.username || userData.email || "Anonymous";
      const playerId = userData.clerkUserId;
      const db = getDatabase();
      const typingRef = ref(db, `typing/${CHAT_ROOM_ID}/${playerId}`);

      if (isTyping) {
        // Add typing status to Firebase
        const typingData = {
          playerId,
          playerName,
          isTyping: true,
          timestamp: new Date().toISOString(),
        };

        set(typingRef, typingData);
      } else {
        // Remove typing status
        remove(typingRef);
      }
    } catch (error) {
      console.error("Error updating typing status:", error);
    }
  };

  // Listen for typing status changes
  useEffect(() => {
    if (!userData) return;

    try {
      const db = getDatabase();
      const typingRef = ref(db, `typing/${CHAT_ROOM_ID}`);

      const typingUnsubscribe = onValue(typingRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();

          const typingUsersList = Object.values(data)
            .filter((user: any) => {
              // Filter out stale typing statuses (older than 10 seconds)
              const typingTime = new Date(user.timestamp).getTime();
              const now = new Date().getTime();
              const isRecent = now - typingTime < 10000; // 10 seconds
              const isNotCurrentUser = user.playerId !== userData.clerkUserId;

              return isRecent && isNotCurrentUser && user.isTyping;
            })
            .map((user: any) => user.playerName);

          setTypingUsers(typingUsersList);
        } else {
          setTypingUsers([]);
        }
      });

      return () => {
        off(typingRef);
      };
    } catch (error) {
      console.error("Error setting up typing listener:", error);
    }
  }, [userData]);

  // Clean up typing status on unmount
  useEffect(() => {
    return () => {
      if (userData) {
        try {
          const db = getDatabase();
          const typingRef = ref(
            db,
            `typing/${CHAT_ROOM_ID}/${userData.clerkUserId}`
          );
          remove(typingRef);
        } catch (error) {
          console.error("Error cleaning up typing status:", error);
        }
      }
    };
  }, [userData]);

  // Reset unread count
  const resetUnreadCount = () => {
    setUnreadCount(0);
  };

  // Toggle chat visibility
  const toggleChat = () => {
    if (!isChatVisible) {
      setLastChatOpenTime(new Date());
      setUnreadCount(0);
    }
    setIsChatVisible(!isChatVisible);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
        typingUsers,
        setTyping,
        unreadCount,
        resetUnreadCount,
        isChatVisible,
        toggleChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
