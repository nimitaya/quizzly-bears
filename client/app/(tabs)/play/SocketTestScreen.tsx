import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TextInput } from 'react-native';
import { ButtonPrimary, ButtonSecondary } from '@/components/Buttons';
import { Logo } from '@/components/Logos';
import { FontSizes, Gaps } from '@/styles/theme';
import { socketService } from '@/utilities/socketService';

const SocketTestScreen = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('TestPlayer');
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    setupSocketListeners();
    return () => {
      socketService.disconnect();
    };
  }, []);

  const setupSocketListeners = () => {
    socketService.onRoomCreated((data) => {
      addMessage(`Room created: ${data.roomId}`);
      setRoomId(data.roomId);
    });

    socketService.onRoomJoined((data) => {
      addMessage(`Joined room: ${data.room.name}`);
    });

    socketService.onPlayerJoined((data) => {
      addMessage(`Player joined: ${data.player.name}`);
    });

    socketService.onError((error) => {
      addMessage(`Error: ${error.message}`);
    });
  };

  const addMessage = (message: string) => {
    setMessages(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const connectToServer = async () => {
    try {
      await socketService.connect();
      setIsConnected(true);
      addMessage('Connected to server');
    } catch (error) {
      Alert.alert('Connection Error', 'Failed to connect to server');
      addMessage('Connection failed');
    }
  };

  const createTestRoom = () => {
    if (!isConnected) {
      Alert.alert('Error', 'Please connect to server first');
      return;
    }

    const roomSettings = {
      questionCount: 10,
      timePerQuestion: 30,
      categories: ['General'],
      difficulty: 'medium' as const
    };

    socketService.createRoom('Test Room', playerName, 'test-user-123', roomSettings);
  };

  const joinTestRoom = () => {
    if (!isConnected) {
      Alert.alert('Error', 'Please connect to server first');
      return;
    }

    if (!roomId.trim()) {
      Alert.alert('Error', 'Please enter room ID');
      return;
    }

    socketService.joinRoom(roomId, 'test-user-456', playerName);
  };

  const disconnect = () => {
    socketService.disconnect();
    setIsConnected(false);
    addMessage('Disconnected from server');
  };

  return (
    <View style={styles.container}>
      <Logo size="small" />
      
      <Text style={styles.title}>Socket.IO Test</Text>
      
      <Text style={styles.status}>
        Status: {isConnected ? 'Connected' : 'Disconnected'}
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Player Name"
          value={playerName}
          onChangeText={setPlayerName}
        />
        <TextInput
          style={styles.input}
          placeholder="Room ID (for joining)"
          value={roomId}
          onChangeText={setRoomId}
        />
      </View>

      <View style={styles.buttonContainer}>
        {!isConnected ? (
          <ButtonPrimary text="Connect to Server" onPress={connectToServer} />
        ) : (
          <>
            <ButtonPrimary text="Create Room" onPress={createTestRoom} />
            <ButtonSecondary text="Join Room" onPress={joinTestRoom} />
            <ButtonSecondary text="Disconnect" onPress={disconnect} />
          </>
        )}
      </View>

      <View style={styles.messagesContainer}>
        <Text style={styles.messagesTitle}>Messages:</Text>
        {messages.map((message, index) => (
          <Text key={index} style={styles.message}>{message}</Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: FontSizes.H1Fs,
    fontWeight: 'bold',
    marginVertical: Gaps.g24,
  },
  status: {
    fontSize: FontSizes.TextLargeFs,
    marginBottom: Gaps.g24,
  },
  inputContainer: {
    width: '100%',
    marginBottom: Gaps.g24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: Gaps.g16,
    marginBottom: Gaps.g16,
    fontSize: FontSizes.TextMediumFs,
  },
  buttonContainer: {
    width: '100%',
    gap: Gaps.g16,
    marginBottom: Gaps.g24,
  },
  messagesContainer: {
    flex: 1,
    width: '100%',
  },
  messagesTitle: {
    fontSize: FontSizes.TextLargeFs,
    fontWeight: 'bold',
    marginBottom: Gaps.g8,
  },
  message: {
    fontSize: FontSizes.TextSmallFs,
    marginBottom: Gaps.g4,
    color: '#666',
  },
});

export default SocketTestScreen;
