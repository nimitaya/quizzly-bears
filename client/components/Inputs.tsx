import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  useWindowDimensions,
  TouchableOpacity,
  Text,
  FlatList,
  Keyboard,
} from "react-native";
import { Colors, FontSizes, Gaps } from "../styles/theme";
import { ButtonSearchFriend } from "./Buttons";
import IconEye from "@/assets/icons/IconEye";
import IconEyeClose from "@/assets/icons/IconEyeClose";
import { searchEmailsAutocomplete } from "@/utilities/friendRequestApi";

// 1. Universal Search Input
type SearchInputProps = TextInputProps & {
  isPassword?: boolean;
};

export function SearchInput(props: SearchInputProps) {
  const { width } = useWindowDimensions();
  const inputWidth = Math.min(348, width - 32);
  const { isPassword = false, style, ...rest } = props;

  return (
    <View style={[styles.containerSearch, { width: inputWidth }]}>
      <TextInput
        style={[
          styles.inputSearch,
          isPassword
            ? { paddingLeft: 32, paddingRight: 48 }
            : { paddingHorizontal: 32 },
          style,
        ]}
        placeholderTextColor={Colors.disable}
        autoComplete="username"
        textContentType="username"
        {...rest}
      />
    </View>
  );
}

//==============Types for autocomplete
interface EmailSuggestion {
  _id: string;
  email: string;
}

//==============Input with search button (AUTOCOMPLETE)
type SearchFriendInputProps = TextInputProps & {
  onSearch?: (value: string) => void;
  clerkUserId?: string; 
};

export function SearchFriendInput({
  onSearch,
  value,
  onChangeText,
  clerkUserId,
  ...props
}: SearchFriendInputProps) {
  const inputRef = useRef<string>(value || "");
  
  //===========States für Autocomplete
  const [suggestions, setSuggestions] = useState<EmailSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChangeText = (text: string) => {
    inputRef.current = text;
    onChangeText?.(text);
  };

  const handleSearch = () => {
    setShowSuggestions(false);
    Keyboard.dismiss();
    onSearch?.(inputRef.current);
  };
  
  //=============== Function to search suggestions
    const searchSuggestions = async (query: string) => {
      if (!clerkUserId || query.length < 2) {
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
  
    //======Debounce: wartet 300ms nach der letzten Eingabe
    useEffect(() => {
      if (!clerkUserId) return;
  
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
      }, 300);
  //====== Cleanup function to clear the timeout
      return () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
      };
    }, [value, clerkUserId]);
  
    //======Email suggestion selection,dropdown wird geschlossen
    const handleSuggestionPress = (email: string) => {
      handleChangeText(email);
      setShowSuggestions(false);
      Keyboard.dismiss();
      onSearch?.(email);
    };
  
    //========Blur event to close suggestions
    const handleBlur = () => {
      setTimeout(() => {
        setShowSuggestions(false);
      }, 150);
    };
  
    //======Render function for each email suggestion
    const renderSuggestion = ({ item }: { item: EmailSuggestion }) => (
      <TouchableOpacity
        style={styles.suggestionItem}
        onPress={() => handleSuggestionPress(item.email)}
      >
        <Text style={styles.suggestionText}>{item.email}</Text>
      </TouchableOpacity>
    );
  

  return (
    <View style={styles.containerSearchFriendWrapper}>
      <View style={styles.containerSearchFriend}>
        <TextInput
          style={styles.inputSearchFriend}
          placeholderTextColor={Colors.disable}
          autoComplete="email"
          keyboardType="email-address"
          autoCapitalize="none"
          textContentType="emailAddress"
          value={value}
          onChangeText={handleChangeText}
          onBlur={handleBlur}
          onFocus={() => {
            if (suggestions.length > 0 && clerkUserId) {
              setShowSuggestions(true);
            }
          }}
          {...props}
        />
        <View style={{ width: 8 }} />
        <ButtonSearchFriend onPress={handleSearch} />
      </View>

      {/* Email Suggest nur wenn die in Clerk sind*/}
      {clerkUserId && showSuggestions && suggestions.length > 0 && (
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
}

// 3. Password Input with toggle visibility
type PasswordInputProps = TextInputProps & {
  value: string;
  onChangeText: (text: string) => void;
};

export function PasswordInput({
  value,
  onChangeText,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.eyeContainer}>
      <SearchInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!showPassword}
        placeholder="Enter password"
        isPassword
        autoComplete="password"
        textContentType="password"
        {...props}
      />
      <TouchableOpacity
        style={styles.eyeIcon}
        onPress={() => setShowPassword((prev) => !prev)}
      >
        {showPassword ? <IconEye /> : <IconEyeClose />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  containerSearch: {
    width: "100%",
    maxWidth: 348,
    alignSelf: "center",
  },
  inputSearch: {
    height: 56,
    borderRadius: 50,
    backgroundColor: Colors.bgGray,
    color: Colors.black,
    borderStyle: "solid",
    borderWidth: 2,
    borderColor: Colors.primaryLimo,
    width: "100%",
    paddingHorizontal: 32,
    fontSize: FontSizes.TextLargeFs,
    textAlign: "center",
  },
  // Wrapper para las sugerencias - NUEVO
  containerSearchFriendWrapper: {
    width: "100%",
    alignSelf: "center",
    position: "relative",
    maxWidth: 348,
    zIndex: 1002,
  },
  // ESTILO ORIGINAL - SIN CAMBIOS
  containerSearchFriend: {
    width: "100%",
    alignSelf: "center",
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 348,
  },
  // ESTILO ORIGINAL - SIN CAMBIOS
  inputSearchFriend: {
    height: 56,
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: Colors.bgGray,
    color: Colors.black,
    borderStyle: "solid",
    borderWidth: 2,
    borderColor: Colors.primaryLimo,
    flex: 1,
    paddingHorizontal: 32,
    fontSize: FontSizes.TextLargeFs,
  },
  eyeContainer: {
    position: "relative",
    alignSelf: "center",
  },
  eyeIcon: {
    position: "absolute",
    right: Gaps.g24,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    zIndex: 1,
  },
  // NUEVOS ESTILOS para las sugerencias
  suggestionsContainer: {
    position: "absolute",
    top: 64, // Justo debajo del input (56px de altura + 8px de margen)
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primaryLimo,
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
    paddingHorizontal: 32, // Mismo padding que el input
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.disable,
  },
  suggestionText: {
    fontSize: FontSizes.TextLargeFs, // Mismo tamaño que el input
    color: Colors.black,
  },
});