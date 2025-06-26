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

export function ButtonPrimary({
  text,
  ...props
}: PressableProps & { text: string }) {
  const { width } = useWindowDimensions();
  const buttonWidth = Math.min(348, width - 32);

  return (
    <Pressable {...props}>
      <View style={[styles.buttonPrimary, { width: buttonWidth }]}>
        <Text style={styles.textPrimaryButton}>{text}</Text>
      </View>
    </Pressable>
  );
}
export function ButtonPrimaryDisabled({
  text,
  ...props
}: PressableProps & { text: string }) {
  const { width } = useWindowDimensions();
  const buttonWidth = Math.min(348, width - 32);

  return (
    <Pressable {...props}>
      <View style={[styles.buttonPrimaryDisabled, { width: buttonWidth }]}>
        <Text style={styles.textPrimaryButtonDisabled}>{text}</Text>
      </View>
    </Pressable>
  );
}
export function ButtonSecondary({
  text,
  icon,
  ...props
}: PressableProps & { text: string; icon?: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const buttonWidth = Math.min(348, width - 32);

  return (
    <Pressable {...props}>
      <View style={[styles.buttonSecondary, { width: buttonWidth }]}>
        {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
        <Text style={styles.textSecondaryButton}>{text}</Text>
      </View>
    </Pressable>
  );
}
export function ButtonSkip({
  text,
  ...props
}: PressableProps & { text: string }) {
  const { width } = useWindowDimensions();
  const buttonWidth = Math.min(348, width - 32);

  return (
    <Pressable {...props}>
      <View style={[styles.buttonSkip, { width: buttonWidth }]}>
        <Text style={styles.textSkipButton}>{text}</Text>
      </View>
    </Pressable>
  );
}
export function ButtonSmallPrimary({
  text,
  ...props
}: PressableProps & { text: string }) {
  const { width } = useWindowDimensions();
  const buttonWidth = Math.min(120, width - 16);

  return (
    <Pressable {...props}>
      <View style={[styles.buttonSmallPrimary, { width: buttonWidth }]}>
        <Text style={styles.textSmallPrimaryButton}>{text}</Text>
      </View>
    </Pressable>
  );
}
export function ButtonSmallSecondary({
  text,
  ...props
}: PressableProps & { text: string }) {
  const { width } = useWindowDimensions();
  const buttonWidth = Math.min(120, width - 16);

  return (
    <Pressable {...props}>
      <View style={[styles.buttonSmallSecondary, { width: buttonWidth }]}>
        <Text style={styles.textSmallSecondaryButton}>{text}</Text>
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
});
