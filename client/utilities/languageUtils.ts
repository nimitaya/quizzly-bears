// ==========Funktion for recent language =========================

export const getLocalizedText = (
  textObject: any,
  currentLanguageCode: string
): string => {
  if (!textObject || typeof textObject !== "object") {
    return textObject || "";
  }

  // Translate the text based on the current language code
  return (
    textObject[currentLanguageCode] || textObject.en || textObject.de || ""
  );
};
