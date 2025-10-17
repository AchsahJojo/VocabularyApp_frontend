import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";

const API_BASE_URL = 'http://localhost:8080';

const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
};

export default function LoginPage() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    console.log("Attempting login with email:", email);

    try {
      console.log("Calling URL:", API_ENDPOINTS.LOGIN);
      
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password
        }),
      });

      console.log(" Response status:", response.status);
      const data = await response.json();
      console.log(" Login response:", JSON.stringify(data, null, 2));

      if (response.ok) {
        console.log(" Login successful! UserID:", data.userId);
        (navigation as any).navigate("LandingPage", { userID: data.userId });
      } else {
        Alert.alert("Login Failed", data.error || "An error occurred");
      }
    } catch (error) {
      console.error(" Login error:", error);
      Alert.alert("Connection Error", "Could not connect to server. Make sure the backend is running on port 8080.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        editable={!loading}
      />
      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        secureTextEntry 
        value={password} 
        onChangeText={setPassword}
        autoCapitalize="none"
        editable={!loading}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#FF5733" style={{ marginTop: 20 }} />
      ) : (
        <Button 
          title="Log In" 
          onPress={handleLogin} 
          color="#FF5733"
        />
      )}
      <TouchableOpacity onPress={() => (navigation as any).navigate("ForgotPassword")}> 
        <Text style={{ color: "blue", marginTop: 10 }}>Forgot/Reset Password?</Text> 
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#adba95",
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
    backgroundColor: "#fff",
  },
});