import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import socketService from '../utilities/socketService';

interface FriendOnlineStatus {
  userId: string;
  isOnline: boolean;
}

export const useOnlineStatus = (friendIds: string[] = []) => {
  const { user } = useUser();
  const [friendsStatus, setFriendsStatus] = useState<Map<string, boolean>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!user || !socketService.isConnected()) return;

    console.log('🔌 Setting user online:', user.id);
    // Set current user as online when component mounts
    socketService.setUserOnline(user.id);

    // Request initial status of friends
    if (friendIds.length > 0) {
      console.log('📋 Requesting status for friends:', friendIds);
      socketService.getFriendsStatus(friendIds);
    }

    // Listen for friend status changes
    const handleFriendStatusChanged = (data: { userId: string; isOnline: boolean }) => {
      console.log('📡 Friend status changed:', data);
      setFriendsStatus(prev => new Map(prev).set(data.userId, data.isOnline));
    };

    // Listen for initial friends status
    const handleFriendsStatus = (friendsStatus: FriendOnlineStatus[]) => {
      console.log('📊 Initial friends status:', friendsStatus);
      const statusMap = new Map<string, boolean>();
      friendsStatus.forEach(friend => {
        statusMap.set(friend.userId, friend.isOnline);
      });
      setFriendsStatus(statusMap);
      setIsInitialized(true);
    };

    socketService.onFriendStatusChanged(handleFriendStatusChanged);
    socketService.onFriendsStatus(handleFriendsStatus);

    return () => {
      // Clean up listeners when component unmounts
      socketService.off("friend-status-changed", handleFriendStatusChanged);
      socketService.off("friends-status", handleFriendsStatus);
    };
  }, [user, friendIds.join(',')]); // Re-run if friendIds change

  // Update friends status when friendIds change
  useEffect(() => {
    if (socketService.isConnected() && friendIds.length > 0) {
      socketService.getFriendsStatus(friendIds);
    }
  }, [friendIds.join(',')]);

  const isUserOnline = (userId: string): boolean => {
    return friendsStatus.get(userId) || false;
  };

  const getOnlineFriends = (): string[] => {
    return Array.from(friendsStatus.entries())
      .filter(([_, isOnline]) => isOnline)
      .map(([userId, _]) => userId);
  };

  const getOfflineFriends = (): string[] => {
    return Array.from(friendsStatus.entries())
      .filter(([_, isOnline]) => !isOnline)
      .map(([userId, _]) => userId);
  };

  return {
    friendsStatus,
    isUserOnline,
    getOnlineFriends,
    getOfflineFriends,
    isInitialized, // Useful to show loading state
  };
};
