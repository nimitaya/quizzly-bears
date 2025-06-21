import { Stack } from 'expo-router'

const _layout = () => {
  return (
      <Stack>
        <Stack.Screen name="CategoryScreen" />
        <Stack.Screen name="InviteScreen" />
        <Stack.Screen name="WaitingRoomScreen" />
        <Stack.Screen name="StartQuizScreen" />
        <Stack.Screen name="QuizScreen" />
        <Stack.Screen name="SoloResultScreen" />
        <Stack.Screen name="GroupResultScreen" />
        <Stack.Screen name="SummaryResultScreen" />
      </Stack>
  )
}
export default _layout