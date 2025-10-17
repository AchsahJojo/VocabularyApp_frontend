import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

const API_BASE_URL = "http://localhost:8080";

interface WordInList {
  id: string;
  listId: string;
  userId: string;
  word: string;
  definition: string;
  createdAt?: string;
}

interface RouteParams {
  userID: string;
  listID: string;
  listName: string;
}

interface WordListPageProps {
  route: {
    params: RouteParams;
  };
}

const WordListPage = ({ route }: WordListPageProps) => {
  const [loading, setLoading] = useState(true);
  const [wordList, setWordList] = useState<WordInList[]>([]);
  const navigation = useNavigation();
  const { userID, listID, listName } = route.params;
  const [headerListName, setHeaderListName] = useState<string | null>(
    route.params?.listName ?? null
  );

  useEffect(() => {
    console.log("📖 WordListPage loaded");
    console.log("👤 userID:", userID);
    console.log("📁 listID:", listID);
    console.log("📋 listName:", listName);

    if (userID && listID) {
      loadWordList();
    }
  }, [userID, listID]);

  const loadWordList = async () => {
    setLoading(true);
    try {
      console.log("🔍 Fetching words from backend...");
      const url = `${API_BASE_URL}/api/vocab/words/${userID}/${listID}`;
      console.log("🌐 URL:", url);

      const response = await fetch(url);

      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error response:", errorText);
        throw new Error(`Failed to fetch words: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Received words payload:", JSON.stringify(data, null, 2));
      const words: WordInList[] = data.words || [];
      const nameFromServer: string | null = data.listName || null;
      console.log("📊 Total words:", words.length);

      setWordList(words);
      if (nameFromServer) setHeaderListName(nameFromServer);
    } catch (error) {
      console.error("❌ Error loading words:", error);
      Alert.alert(
        "Error",
        "Failed to load words. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            console.log("🔙 Navigating back to VocabListPage");
            (navigation as any).navigate("VocabListPage", { userID });
          }}
        >
          <Text style={styles.backButtonText}>&#8249; Back</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{headerListName || "Vocab List"}</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={loadWordList}>
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      <SafeAreaView style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5dade2" />
            <Text style={styles.loadingText}>Loading words...</Text>
          </View>
        ) : wordList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.noWordsText}>No words added yet</Text>
            <Text style={styles.emptySubtext}>
              Add words to this list from the landing page!
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.wordCount}>
              {wordList.length} {wordList.length === 1 ? "word" : "words"} in
              this list
            </Text>
            <FlatList
              data={wordList}
              renderItem={({ item }: { item: WordInList }) => (
                <View style={styles.wordItem}>
                  <Text style={styles.word}>{item.word}</Text>
                  <Text style={styles.definition}>{item.definition}</Text>
                  {item.createdAt ? (
                    <Text style={styles.dateText}>
                      Added: {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  ) : null}
                </View>
              )}
              keyExtractor={(item) => item.id}
              refreshing={loading}
              onRefresh={loadWordList}
            />
          </>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    backgroundColor: "white",
    borderBottomColor: "#ddd",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: "#5dade2",
    fontSize: 16,
    fontWeight: "600",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    fontSize: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  noWordsText: {
    textAlign: "center",
    color: "#888",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
  },
  wordCount: {
    fontSize: 14,
    color: "#666",
    marginVertical: 12,
    textAlign: "center",
  },
  wordItem: {
    padding: 16,
    marginVertical: 6,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  word: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 6,
  },
  definition: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  dateText: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
    fontStyle: "italic",
  },
});

export default WordListPage;
