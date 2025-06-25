import { Stack } from "expo-router";

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen name="FaqScreen" />
      <Stack.Screen name="FriendsScreen" />
      <Stack.Screen name="InvitationsScreen" />
      <Stack.Screen name="Clerk" />
    </Stack>
  );
};
export default _layout;
