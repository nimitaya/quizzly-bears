import { User, FriendStatus, FriendItemProps } from "@/utilities/friendInterfaces";
import { View, Text } from "react-native";

interface ExtendedFriendItemProps extends Omit<FriendItemProps, 'onPressTwo'> {
  isOnline?: boolean;
  onPressTwo?: () => void;
}

const FriendItem = ({ friend, onPressOne, onPressTwo, friendStatus, isOnline }: ExtendedFriendItemProps) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
      {/* Online Status Indicator */}
      <View 
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: isOnline ? '#4CAF50' : '#9E9E9E',
          marginRight: 10
        }}
      />
      
      <View style={{ flex: 1 }}>
        <Text>{friend.email}</Text>
        {friendStatus === "friend" && (
          <Text style={{ fontSize: 12, color: isOnline ? '#4CAF50' : '#9E9E9E' }}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        )}
      </View>

      {friendStatus === "request" ? (
        <View>
          <Text onPress={onPressOne}>Accept</Text>
          <Text onPress={onPressTwo}>Decline</Text>
        </View>
      ) : friendStatus === "outstanding" ? (
        <Text>Pending</Text>
      ) : friendStatus === "friend" ? (
        <Text onPress={onPressOne}>Remove</Text>
      ) : null}
    </View>
  );
};

export default FriendItem;
