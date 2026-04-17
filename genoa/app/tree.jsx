import React from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BasicTree from "../components/tree/BasicTree";

export default function TreeScreen() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <BasicTree />
      </View>
    </GestureHandlerRootView>
  );
}
