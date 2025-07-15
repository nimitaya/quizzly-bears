import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  Keyboard,
} from "react-native";
import IconSearchFriend from "@/assets/icons/IconSearchFriend";
import { Colors, FontSizes, Gaps } from "@/styles/theme";
import { searchEmailsAutocomplete } from "@/utilities/friendRequestApi";

interface EmailSuggestion {
  _id: string;
  email: string;
}

interface SearchFriendInputWithAutocompleteProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSearch: (email: string) => void;
  clerkUserId: string;
}

export const SearchFriendInputWithAutocomplete: React.FC<
  SearchFriendInputWithAutocompleteProps
> = ({ placeholder, value, onChangeText, onSearch, clerkUserId }) => {
  const [suggestions, setSuggestions] = useState<EmailSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<TextInput>(null);

  // Función para buscar sugerencias
  const searchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setIsLoading(true);
      const result = await searchEmailsAutocomplete(query, clerkUserId);
      setSuggestions(result.users);
      setShowSuggestions(result.users.length > 0);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce para las búsquedas
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (value) {
        searchSuggestions(value);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300) as unknown as NodeJS.Timeout;

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, clerkUserId]);

  // Manejar selección de sugerencia
  const handleSuggestionPress = (email: string) => {
    onChangeText(email);
    setShowSuggestions(false);
    Keyboard.dismiss();
    onSearch(email);
  };

  // Manejar búsqueda manual
  const handleSearch = () => {
    setShowSuggestions(false);
    Keyboard.dismiss();
    onSearch(value);
  };

  // Ocultar sugerencias cuando el input pierde el foco
  const handleBlur = () => {
    // Pequeño delay para permitir que se procese el press en las sugerencias
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
  };

  const renderSuggestion = ({ item }: { item: EmailSuggestion }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item.email)}
    >
      <Text style={styles.suggestionText}>{item.email}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.bgGray}
          value={value}
          onChangeText={onChangeText}
          onBlur={handleBlur}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <IconSearchFriend />
        </TouchableOpacity>
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item._id}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 1000,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: Gaps.g8,
    paddingHorizontal: Gaps.g16,
    height: 48,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.TextMediumFs,
    color: Colors.black,
  },
  searchButton: {
    padding: Gaps.g4,
  },
  suggestionsContainer: {
    position: "absolute",
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderRadius: Gaps.g8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: 200,
    zIndex: 1001,
  },
  suggestionsList: {
    flexGrow: 0,
  },
  suggestionItem: {
    paddingHorizontal: Gaps.g16,
    paddingVertical: Gaps.g16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bgGray,
  },
  suggestionText: {
    fontSize: FontSizes.TextMediumFs,
    color: Colors.black,
  },
});