// ==========Funktion um den aktuellen Sprachcode zu erhalten=========================

export const getLocalizedText = (textObject: any, currentLanguageCode: string): string => {
    if (!textObject || typeof textObject !== 'object') {
      return textObject || '';
    }
    
    // Priorizieren der Übersetzung in der aktuellen Sprache
    return textObject[currentLanguageCode] || textObject.de || textObject.en || '';
  };