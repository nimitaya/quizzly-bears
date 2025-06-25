import { View, Text, Image } from "react-native";
const Loading = () => {
  return (
    <View>
      <Text>Loading...</Text>
      <Image
        source={{
          uri: "https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gif",
        }}
        style={{ width: 100, height: 100, alignSelf: "center" }}
        accessibilityLabel="Loading animation"
      />
    </View>
  );
};
export default Loading;
