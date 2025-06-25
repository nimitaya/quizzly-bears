import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, TextInput, Alert } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";

export default function ProfileScreenComp() {
  const { signOut } = useAuth();
  const { user, isLoaded } = useUser();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (user) {
      setEmail(user.primaryEmailAddress?.emailAddress || "");
      setUsername(user.username || "");
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSave = async () => {
    try {
      await user?.update({ username });
      Alert.alert("Success", "Username updated!");
    } catch (err) {
      Alert.alert("Error", "Could not update username.");
    }
  };

  if (!isLoaded) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Profile Settings</Text>
      <Text>Email: {email}</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />

      <Button title="Save Changes" onPress={handleSave} />
      <View style={{ marginTop: 20 }}>
        <Button title="Sign Out" onPress={handleSignOut} color="red" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginVertical: 12,
    borderRadius: 8,
  },
});
