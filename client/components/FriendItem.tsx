import { FriendItemProps } from "@/utilities/friendInterfaces";
import { View, Text } from "react-native";

const FriendItem = ({
  friend,
  onPressOne,
  onPressTwo,
  friendStatus,
}: FriendItemProps) => {
  return (
    <View>
      <Text>{friend.email}</Text>
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
