import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import { FontSizes, Gaps, Colors } from "@/styles/theme";
import SingleFlag from "@/utilities/flags";
import { LANGUAGES } from "@/utilities/languages";
import { useLanguage } from "@/providers/LanguageContext";

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flagId: string;
}

interface LanguageDropdownProps {
  onLanguageChange?: (language: Language) => void;
}

const LanguageDropdown = ({ onLanguageChange }: LanguageDropdownProps) => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLanguageSelect = async (language: Language) => {
    try {
      await changeLanguage(language);
      setIsDropdownOpen(false);

      // Call the callback function if provided
      if (onLanguageChange) {
        onLanguageChange(language);
      }
    } catch (error) {
      console.error("Error saving language:", error);
    }
  };

  const renderLanguageItem = ({ item }: { item: Language }) => (
    <TouchableOpacity
      style={[
        styles.languageItem,
        currentLanguage.code === item.code && styles.selectedItem,
      ]}
      onPress={() => handleLanguageSelect(item)}
    >
      <View style={styles.flagContainer}>
        <SingleFlag id={item.flagId} size={0.15} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.languageName}>{item.name}</Text>
        <Text style={styles.nativeName}>{item.nativeName}</Text>
      </View>
      {currentLanguage.code === item.code && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setIsDropdownOpen(true)}
      >
        <Text style={styles.languageText}>Language </Text>
        <View style={styles.flagContainer}>
          <SingleFlag id={currentLanguage.flagId} size={0.2} />
        </View>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isDropdownOpen}
        onRequestClose={() => setIsDropdownOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsDropdownOpen(false)}
        >
          <View style={styles.dropdownContainer}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Select Language</Text>
              <TouchableOpacity
                onPress={() => setIsDropdownOpen(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={LANGUAGES}
              renderItem={renderLanguageItem}
              keyExtractor={(item) => item.code}
              style={styles.languageList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Gaps.g32,
  },
  languageText: {
    fontSize: FontSizes.H3Fs,
    marginRight: Gaps.g8,
  },
  flagContainer: {
    width: 25,
    height: 25,
    borderRadius: 100,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: Gaps.g16,
    width: "85%",
    maxHeight: "70%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Gaps.g16,
    paddingBottom: Gaps.g8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  dropdownTitle: {
    fontSize: FontSizes.H2Fs,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: Gaps.g4,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "bold",
  },
  languageList: {
    flexGrow: 0,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Gaps.g16,
    paddingHorizontal: Gaps.g8,
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedItem: {
    backgroundColor: Colors.disablelLimo,
  },
  textContainer: {
    flex: 1,
    marginLeft: Gaps.g16,
  },
  languageName: {
    fontSize: FontSizes.H3Fs,
    fontWeight: "500",
    color: "#333",
  },
  nativeName: {
    fontSize: FontSizes.H3Fs,
    color: "#666",
    marginTop: 2,
  },
  checkmark: {
    fontSize: 18,
    color: "#2196f3",
    fontWeight: "bold",
  },
});

export default LanguageDropdown;
