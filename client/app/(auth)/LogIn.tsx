import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Alert,
} from "react-native";
import React from "react";
import { useOAuth } from "@clerk/clerk-expo";
import { Colors } from "@/styles/theme";

export default function LogIn() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(tabs)/play");
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const handlePress = async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        Alert.alert("Success", "Signed in with Google!");
        router.replace("/(tabs)/play");
      }
    } catch (err: any) {
      console.error("Google OAuth error:", err);
      Alert.alert("Error", err.message || "Google sign-in failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        onChangeText={setEmailAddress}
      />
      <TextInput
        style={styles.input}
        value={password}
        placeholder="Enter password"
        secureTextEntry={true}
        onChangeText={setPassword}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={onSignInPress}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Signing in..." : "Continue"}
        </Text>
      </TouchableOpacity>

      <View style={styles.linkContainer}>
        <Text>Don't have an account?</Text>
        <Link href="/(auth)/SignUp">
          <Text style={styles.link}>Sign up</Text>
        </Link>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.googleButton]}
        onPress={handlePress}
      >
        <Text style={styles.buttonText}>Sign in with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: Colors.primaryLimo || "#007BFF",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  googleButton: {
    marginTop: 15,
    backgroundColor: "#4285F4",
  },
  linkContainer: {
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    marginVertical: 10,
  },
  link: {
    color: Colors.primaryLimo || "#007BFF",
  },
});
