import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ImageBackground } from "react-native";
import { useNavigation } from "@react-navigation/native";

// Define API endpoints directly in this file
const API_BASE_URL = 'http://localhost:8080';

const API_ENDPOINTS = {
  RANDOM_WORD: `${API_BASE_URL}/api/dictionary/random`,
  GET_LISTS_NO_HISTORY: (userId: string) => `${API_BASE_URL}/api/vocab/lists/${userId}/exclude-history`,
  ADD_WORD: `${API_BASE_URL}/api/vocab/words`,
};

interface RouteParams {
  userID: string;
}

interface LandingScreenProps {
  route: {
    params: RouteParams;
  };
}

const LandingScreen = ({ route }: LandingScreenProps) => {
  const [dailyWord, setDailyWord] = useState<string | null>(null);
  const [definition, setDefinition] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [vocabHistoryID, setVocabHistoryID] = useState<string | null>(null);
  const navigation = useNavigation();
  const { userID } = route.params;

  useEffect(() => {
    fetchDailyWord();
    getVocabHistoryID();
  }, []);

  const fetchDailyWord = async () => {
    setLoading(true);
    try {
      console.log("🔍 Fetching random word from:", API_ENDPOINTS.RANDOM_WORD);
      const response = await fetch(API_ENDPOINTS.RANDOM_WORD);

      if (!response.ok) {
        throw new Error('Failed to fetch random word from server');
      }

      const data = await response.json();
      console.log("✅ Random word from MongoDB:", data);

      setDailyWord(data.word || "No word available");
      setDefinition(data.shortdef || "Definition not available.");
    } catch (error) {
      console.error("❌ Error fetching daily word:", error);
      setDailyWord("No word available");
      setDefinition("Could not connect to server. Please check your backend.");
    } finally {
      setLoading(false);
    }
  };

  const getVocabHistoryID = async () => {
    try {
      console.log(" Fetching vocab lists for userID:", userID);
      const url = API_ENDPOINTS.GET_LISTS_NO_HISTORY(userID);
      console.log(" Request URL:", url);
      
      const response = await fetch(url);
      
      console.log(" Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(" Error response:", errorText);
        throw new Error(`Failed to fetch vocab lists: ${response.status}`);
      }

      const data = await response.json();
      console.log(" Vocab lists response:", JSON.stringify(data, null, 2));
      
      if (data.vocabHistoryId) {
        setVocabHistoryID(data.vocabHistoryId);
        console.log(" Vocab History ID set:", data.vocabHistoryId);
      } else {
        console.warn("⚠️ No vocabHistoryId in response");
      }
    } catch (error) {
      console.error(" Error getting vocab history ID:", error);
      alert("Error getting vocab history ID: " + error.message);
    }
  };

  const saveWordToHistory = async () => {
    if (!dailyWord || !definition) {
      alert("No word to save");
      return;
    }

    if (!vocabHistoryID) {
      alert("Vocab history not loaded yet. Please wait.");
      return;
    }

    try {
      console.log("💾 Saving word to history:", { dailyWord, definition, vocabHistoryID });
      
      const response = await fetch(API_ENDPOINTS.ADD_WORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userID,
          listId: vocabHistoryID,
          word: dailyWord,
          definition: definition
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`✅ Saved '${dailyWord}' to vocabHistory`);
        alert("Word saved to history!");
      } else {
        console.log(`⚠️ ${data.error}`);
        alert(data.error || "Failed to save word");
      }
    } catch (error) {
      console.error("🚨 Error saving word:", error);
      alert("Could not connect to server");
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/LP_background.png")}
      style={styles.background}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={() => (navigation as any).navigate("HomePage")}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Random Vocabulary Word: </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : (
          <>
            <View style={styles.textBox}>
              <Text style={styles.dailyWord}>{dailyWord || "No word available"}</Text>
              <Text style={styles.definition}>{definition || "Definition not available."}</Text>
            </View>
          </>
        )}

        <TouchableOpacity style={styles.refreshButton} onPress={fetchDailyWord}>
          <Text style={styles.refreshButtonText}>🔄 Refresh Word</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={saveWordToHistory}>
          <Text style={styles.saveButtonText}>✅ Save Word to History</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={() => (navigation as any).navigate("PickList", { userID, vocabHistoryID, dailyWord, definition })} 
          accessibilityLabel="Save Word to Vocab List"
        >
          <Text style={styles.refreshButtonText}>✅ Save to Existing Vocab List</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.createListButton} 
          onPress={() => (navigation as any).navigate("ListCreation", { userID })} 
          accessibilityLabel="Create New List"
        >
          <Text style={styles.createListText}>✨ Create New List</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.vocabListButton}
          onPress={() => (navigation as any).navigate("VocabListPage", { userID, vocabHistoryID })}
        >
          <Text style={styles.vocabListText}>🚀 View Vocab Lists</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    padding: 20,
  },
  logoutButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#d9534f",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  createListButton: {
    backgroundColor: "#77afdd",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  createListText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  vocabListButton: {
    backgroundColor: "#FFA500",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  vocabListText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222222",
    marginBottom: 10,
  },
  textBox: {
    backgroundColor: "rgba(255, 255, 255, 0.62)",
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FFA500",
    marginVertical: 10,
    alignItems: "center",
  },
  dailyWord: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 5,
  },
  definition: {
    fontSize: 18,
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#222222",
    textAlign: "center",
    paddingHorizontal: 10,
  },
  refreshButton: {
    backgroundColor: "#FFA500",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  refreshButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  saveButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default LandingScreen;