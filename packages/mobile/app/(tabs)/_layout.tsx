import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Fonts, TAB_BAR_HEIGHT } from "../../constants/theme";
import { useTheme } from "../../lib/theme";

export default function TabLayout() {
  const { colors } = useTheme();
  // La hauteur est fixée à la main : il faut donc ajouter l'encoche du bas nous-mêmes,
  // sinon les libellés passent sous la barre d'accueil des iPhone.
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingTop: 8,
          paddingBottom: 8 + insets.bottom,
        },
        tabBarLabelStyle: { fontFamily: Fonts.medium, fontSize: 11, lineHeight: 14 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Croquis",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "brush" : "brush-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="garments"
        options={{
          title: "Mes vêtements",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "shirt" : "shirt-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="branding"
        options={{
          title: "Personnaliser",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "color-palette" : "color-palette-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Compte",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
