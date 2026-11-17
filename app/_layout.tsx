import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Manrope_300Light,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";
import { AppProvider } from "@/composition/AppProvider";
import { colors } from "@/ui";

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Manrope_300Light,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  // Hold on the obsidian background until type is ready (no flash of system
  // font). If loading fails we carry on with the system font rather than block.
  if (!loaded && !error) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="light" />
      <AppProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
      </AppProvider>
    </View>
  );
}
