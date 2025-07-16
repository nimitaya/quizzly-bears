import {
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Colors, Radius, FontSizes, Gaps } from "../styles/theme";
import IconSearchFriend from "@/assets/icons/IconSearchFriend";
import { useTranslation } from "@/hooks/useTranslation";
import { TranslationKeys } from "@/utilities/translations";

// Constants for button sizing
const BUTTON_CONSTANTS = {
  LARGE_MAX_WIDTH: 348,
  LARGE_MARGIN: 32,
  SMALL_MAX_WIDTH: 120,
  SMALL_MARGIN: 16,
} as const;

// Custom hook for button width calculation
const useButtonWidth = (maxWidth: number, margin: number) => {
  const { width } = useWindowDimensions();
  return Math.min(maxWidth, width - margin);
};

// Helper function to get button text
const useButtonText = (text?: string, translationKey?: keyof TranslationKeys) => {
  const { t } = useTranslation();
  
  if (translationKey) {
    return t(translationKey);
  }
  
  return text || "";
};

export function ButtonPrimary({
  text,
  translationKey,
  ...props
}: PressableProps & { 
  text?: string; 
  translationKey?: keyof TranslationKeys;
}) {
  const buttonWidth = useButtonWidth(
    BUTTON_CONSTANTS.LARGE_MAX_WIDTH,
    BUTTON_CONSTANTS.LARGE_MARGIN
  );
  const buttonText = useButtonText(text, translationKey);

  return (
    <Pressable {...props}>
      <View style={[styles.buttonPrimary, { width: buttonWidth }]}>
        <Text style={styles.textPrimaryButton}>{buttonText}</Text>
      </View>
    </Pressable>
  );
}

export function ButtonPrimaryDisabled({
  text,
  translationKey,
  ...props
}: PressableProps & { 
  text?: string; 
  translationKey?: keyof TranslationKeys;
}) {
  const buttonWidth = useButtonWidth(
    BUTTON_CONSTANTS.LARGE_MAX_WIDTH,
    BUTTON_CONSTANTS.LARGE_MARGIN
  );
  const buttonText = useButtonText(text, translationKey);

  return (
    <Pressable {...props}>
      <View style={[styles.buttonPrimaryDisabled, { width: buttonWidth }]}>
        <Text style={styles.textPrimaryButtonDisabled}>{buttonText}</Text>
      </View>
    </Pressable>
  );
}

export function ButtonSecondary({
  text,
  translationKey,
  icon,
  showBadge = false,
  ...props
}: PressableProps & {
  text?: string;
  translationKey?: keyof TranslationKeys;
  icon?: React.ReactNode;
  showBadge?: boolean;
}) {
  const buttonWidth = useButtonWidth(
    BUTTON_CONSTANTS.LARGE_MAX_WIDTH,
    BUTTON_CONSTANTS.LARGE_MARGIN
  );
  const buttonText = useButtonText(text, translationKey);

  return (
    <Pressable {...props}>
      <View style={[styles.buttonSecondary, { width: buttonWidth }]}>
        {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
        <View style={styles.textWithBadgeContainer}>
          <Text style={styles.textSecondaryButton}>{buttonText}</Text>
          {showBadge && <View style={styles.notificationBadge} />}
        </View>
      </View>
    </Pressable>
  );
}

export function ButtonSecondaryDisabled({
  text,
  translationKey,
  icon,
  ...props
}: PressableProps & { 
  text?: string; 
  translationKey?: keyof TranslationKeys;
  icon?: React.ReactNode;
}) {
  const buttonWidth = useButtonWidth(
    BUTTON_CONSTANTS.LARGE_MAX_WIDTH,
    BUTTON_CONSTANTS.LARGE_MARGIN
  );
  const buttonText = useButtonText(text, translationKey);

  return (
    <Pressable disabled={true} {...props}>
      <View style={[styles.buttonSecondary, { width: buttonWidth }]}>
        {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
        <Text style={styles.textPrimaryButtonDisabled}>{buttonText}</Text>
      </View>
    </Pressable>
  );
}

export function ButtonSkip({
  text,
  translationKey,
  ...props
}: PressableProps & { 
  text?: string; 
  translationKey?: keyof TranslationKeys;
}) {
  const buttonWidth = useButtonWidth(
    BUTTON_CONSTANTS.LARGE_MAX_WIDTH,
    BUTTON_CONSTANTS.LARGE_MARGIN
  );
  const buttonText = useButtonText(text, translationKey);

  return (
    <Pressable {...props}>
      <View style={[styles.buttonSkip, { width: buttonWidth }]}>
        <Text style={styles.textSkipButton}>{buttonText}</Text>
      </View>
    </Pressable>
  );
}

export function ButtonSmallPrimary({
  text,
  translationKey,
  ...props
}: PressableProps & { 
  text?: string; 
  translationKey?: keyof TranslationKeys;
}) {
  const buttonWidth = useButtonWidth(
    BUTTON_CONSTANTS.SMALL_MAX_WIDTH,
    BUTTON_CONSTANTS.SMALL_MARGIN
  );
  const buttonText = useButtonText(text, translationKey);

  return (
    <Pressable {...props}>
      <View style={[styles.buttonSmallPrimary, { width: buttonWidth }]}>
        <Text style={styles.textSmallPrimaryButton}>{buttonText}</Text>
      </View>
    </Pressable>
  );
}

export function ButtonSmallSecondary({
  text,
  translationKey,
  ...props
}: PressableProps & { 
  text?: string; 
  translationKey?: keyof TranslationKeys;
}) {
  const buttonWidth = useButtonWidth(
    BUTTON_CONSTANTS.SMALL_MAX_WIDTH,
    BUTTON_CONSTANTS.SMALL_MARGIN
  );
  const buttonText = useButtonText(text, translationKey);

  return (
    <Pressable {...props}>
      <View style={[styles.buttonSmallSecondary, { width: buttonWidth }]}>
        <Text style={styles.textSmallSecondaryButton}>{buttonText}</Text>
      </View>
    </Pressable>
  );
}

export function ButtonSearchFriend({ ...props }: PressableProps) {
  return (
    <Pressable {...props}>
      <View style={styles.buttonSearchFriend}>
        <IconSearchFriend />
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  buttonPrimary: {
    backgroundColor: Colors.primaryLimo,
    justifyContent: "center",
    alignItems: "center",
    height: 56,
    alignSelf: "center",
    borderRadius: Radius.r50,
  },
  textPrimaryButton: {
    fontSize: FontSizes.TextLargeFs,
    color: Colors.black,
  },

  buttonPrimaryDisabled: {
    backgroundColor: Colors.disablelLimo,
    justifyContent: "center",
    alignItems: "center",
    height: 56,
    alignSelf: "center",
    borderRadius: Radius.r50,
  },
  textPrimaryButtonDisabled: {
    fontSize: FontSizes.TextLargeFs,
    color: Colors.disable,
  },

  buttonSecondary: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    gap: Gaps.g8,
    paddingHorizontal: 16,
    height: 56,
    alignSelf: "center",
    borderRadius: Radius.r50,
  },
  textSecondaryButton: {
    fontSize: FontSizes.TextLargeFs,
    color: Colors.darkGreen,
  },
  buttonSkip: {
    justifyContent: "center",
    alignItems: "center",
    height: 56,
    alignSelf: "center",
    borderRadius: Radius.r50,
  },
  textSkipButton: {
    fontSize: FontSizes.TextLargeFs,
    color: Colors.darkGreen,
  },
  buttonSmallPrimary: {
    backgroundColor: Colors.primaryLimo,
    justifyContent: "center",
    alignItems: "center",
    height: 48,
    width: 120,
    alignSelf: "center",
    borderRadius: Radius.r50,
  },
  textSmallPrimaryButton: {
    fontSize: FontSizes.TextMediumFs,
    color: Colors.black,
  },
  buttonSmallSecondary: {
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    height: 48,
    width: 120,
    alignSelf: "center",
    borderRadius: Radius.r50,
  },
  textSmallSecondaryButton: {
    fontSize: FontSizes.TextMediumFs,
    color: Colors.darkGreen,
  },
  buttonSearchFriend: {
    backgroundColor: Colors.primaryLimo,
    justifyContent: "center",
    alignItems: "center",
    height: 56,
    width: 80,
    alignSelf: "center",
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
  },
  notificationBadge: {
    width: 8,
    height: 8,
    borderRadius: Gaps.g8,
    backgroundColor: Colors.systemRed,
    marginLeft: Gaps.g8,
    alignSelf: "flex-start",
  },
  textWithBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
