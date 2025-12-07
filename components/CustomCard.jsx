import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";

export default function CustomCard({ children }) {
  const { width } = useWindowDimensions();

  const dynamicStyles = {
    padding: width < 350 ? 12 : 20,
    minHeight: width < 350 ? 400 : 500,
    width: width < 420 ? "90%" : 400,
    borderWidth: width < 350 ? 3 : 5,
  };

  return <View style={[styles.card, dynamicStyles]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#5B6059",
    borderRadius: 20,
    margin: 10,
    maxWidth: 420,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderColor: "black",
  },
});
