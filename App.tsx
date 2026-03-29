import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MapScreen } from "./src/screens/MapScreen";
import { PostFoodScreen } from "./src/screens/PostFoodScreen";
import { MyListingsScreen } from "./src/screens/MyListingsScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Tab.Navigator screenOptions={{ headerTitleAlign: "center" }}>
          <Tab.Screen name="Nearby" component={MapScreen} />
          <Tab.Screen name="Post" component={PostFoodScreen} />
          <Tab.Screen name="My Listings" component={MyListingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
