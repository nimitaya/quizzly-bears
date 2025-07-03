import React, { useState, useRef } from "react";
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import { Colors, FontSizes, Gaps } from "../styles/theme";
import { ButtonSearchFriend } from "./Buttons";
import IconEye from "@/assets/icons/IconEye";
import IconEyeClose from "@/assets/icons/IconEyeClose";

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

// 2. Input with search button
type SearchFriendInputProps = TextInputProps & {
  onSearch?: (value: string) => void;
};

export function SearchFriendInput({ onSearch, value, onChangeText, ...props }: SearchFriendInputProps) {
  const inputRef = useRef<string>(value || "");
  
  const handleChangeText = (text: string) => {
    inputRef.current = text;
    onChangeText?.(text);
  };

  const handleSearch = () => {
    onSearch?.(inputRef.current);
  };

  return (
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
        {...props}
      />
      <View style={{ width: 8 }} />
      <ButtonSearchFriend onPress={handleSearch} />
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
  containerSearchFriend: {
    width: "100%",
    alignSelf: "center",
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 348,
  },
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
});
