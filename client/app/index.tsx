import { Text, View } from "react-native";
import { generateQuestion } from "@/utilities/api/ki";
import { useEffect } from "react";

// This can be the Loading Screen at the beginning of the app

export default function Index() {
  
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}