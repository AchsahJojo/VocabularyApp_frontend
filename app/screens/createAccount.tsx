import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function CreateAccount() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");

  const handleSignUp = async () => {
    try {
      if (!email || !password || !securityQuestion || !securityAnswer) {
        Alert.alert("Error", "All fields are required.");
        return;
      }

      // Call backend API instead of SQLite
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          securityQuestion: securityQuestion,
          securityAnswer: securityAnswer,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Sign Up Successful", "You can now log in.");
        (navigation as any).navigate("LoginPage");
      } else {
        Alert.alert("Sign Up Failed", data.error || "An error occurred");
      }
    } catch (error) {
      // Alert.alert("Sign Up Failed", "Could not connect to server: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput
        style={styles.input}
        placeholder="User Name"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Security Question"
        value={securityQuestion}
        onChangeText={setSecurityQuestion}
      />
      <TextInput
        style={styles.input}
        placeholder="Answer to Security Question"
        value={securityAnswer}
        onChangeText={setSecurityAnswer}
      />
      <Button title="Sign Up" onPress={handleSignUp} color="#FF5733" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#71a2a8",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "80%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});
