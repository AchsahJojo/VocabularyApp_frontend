import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

const API_BASE_URL = 'http://localhost:8080';

interface RouteParams {
  userID: string;
}

interface ListCreationProps {
  route: {
    params: RouteParams;
  };
}

export default function ListCreation({ route }: ListCreationProps) {
  const [listName, setListName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { userID } = route.params;

  const handleListCreation = async () => {
    if (!listName.trim()) {
      Alert.alert("Error", "Please enter a list name.");
      return;
    }
  
    setLoading(true);
    console.log("=".repeat(60));
    console.log("🔍 CREATING LIST");
    console.log("👤 userID:", userID);
    console.log("👤 userID type:", typeof userID);
    console.log("📝 listName:", listName.trim());
    console.log("🌐 API URL:", `${API_BASE_URL}/api/vocab/lists`);
  
    try {
      const requestBody = {
        userId: userID,
        listName: listName.trim()
      };
  
      console.log("📦 Request body:", JSON.stringify(requestBody, null, 2));
  
      const response = await fetch(`${API_BASE_URL}/api/vocab/lists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      console.log("📡 Response status:", response.status);
      console.log("📡 Response ok:", response.ok);
  
      const responseText = await response.text();
      console.log("📄 Raw response:", responseText);
  
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("✅ Parsed response:", JSON.stringify(data, null, 2));
      } catch (e) {
        console.error("❌ Failed to parse response as JSON");
        Alert.alert("Error", "Invalid response from server");
        return;
      }
  
      if (!response.ok) {
        console.error("❌ Error response:", data);
        Alert.alert("Error", data.error || "Failed to create list");
        return;
      }
  
      console.log("✅ SUCCESS! List created:", data);
      Alert.alert("Success", "List created successfully!", [
        {
          text: "OK",
          onPress: () => {
            console.log("🔙 Navigating back to LandingPage");
            (navigation as any).navigate("LandingPage", { userID });
          }
        }
      ]);
  
    } catch (error) {
      console.error("=".repeat(60));
      console.error("❌ EXCEPTION CAUGHT");
      console.error("❌ Error type:", error?.constructor?.name);
      console.error("❌ Error message:", error?.message);
      console.error("❌ Full error:", error);
      console.error("=".repeat(60));
      
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      Alert.alert("Connection Error", "Could not connect to server: " + errorMessage);
    } finally {
      setLoading(false);
      console.log("=".repeat(60));
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => (navigation as any).navigate("LandingPage", { userID })}
        >
          <Text style={styles.backButtonText}>&#8249;- Back</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Create a New Vocab List</Text>
        </View>
        <View style={styles.rightContent} />
      </View>

      <SafeAreaView style={styles.container}>
        <View style={{ gap: 20, marginVertical: 20 }}>
          <TextInput
            placeholder="Enter Vocab List Name"
            value={listName}
            onChangeText={(text) => setListName(text)}
            style={styles.textInput}
            editable={!loading}
            autoFocus
          />
        </View>
        
        {loading ? (
          <View style={{ marginTop: 20 }}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={{ textAlign: 'center', marginTop: 10 }}>Creating list...</Text>
          </View>
        ) : (
          <View style={{ flexDirection: "row", gap: 20, marginTop: 20 }}>
            <TouchableOpacity
              onPress={() => (navigation as any).navigate("LandingPage", { userID })}
              style={[styles.button, { backgroundColor: "red" }]}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleListCreation}
              style={[styles.button, { backgroundColor: "blue" }]}
            >
              <Text style={styles.buttonText}>Create List</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    backgroundColor: "white",
    borderBottomColor: '#ddd',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: "blue",
    fontSize: 16,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rightContent: {
    width: 50,
    alignItems: 'flex-end',
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20,
  },
  textInput: {
    borderWidth: 1,
    padding: 10,
    width: 300,
    borderRadius: 5,
    borderColor: "slategray",
    backgroundColor: "white",
  },
  button: {
    height: 40,
    width: 100,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
  },
  buttonText: {
    fontWeight: "bold",
    color: "white",
    fontSize: 16,
  },
});