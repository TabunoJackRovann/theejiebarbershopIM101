import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  useWindowDimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import axios from "axios";
import CustomCard from "../components/CustomCard";
import Logo from "../assets/Logo.png";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [error, setError] = useState("");

  const { width } = useWindowDimensions();
  const logoSize = width < 350 ? 100 : width < 420 ? 120 : 150;

  const handleRegister = () => {
    setError("");

    if (!name || !email || !password || !phoneNo) {
      setError("All fields are required");
      return;
    }

    axios
      .post("http://127.0.0.1/barbershop_apii/register.php", {
        name,
        email,
        password,
        phoneNo,
      })
      .then((response) => {
        if (response.data.success) {
          Alert.alert("Registration successful!");
          navigation.navigate("Login");
        } else {
          Alert.alert("Registration failed", response.data.message || "");
        }
      })
      .catch((error) => {
        Alert.alert("Error", "Something went wrong");
        console.error("Axios error:", error);
      });
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      {/* NAVBAR (COPIED EXACTLY FROM SAMPLE) */}
      <View style={styles.navBar}>
        <Image source={Logo} style={styles.navLogo} />
        <Text style={styles.navTitle}>THE EJIE BARBERSHOP</Text>
      </View>

      {/* MAIN FORM CARD */}
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <CustomCard style={[styles.card, { width: width > 420 ? 400 : "90%" }]}>
          <Image
            source={Logo}
            style={[styles.regLogo, { width: logoSize, height: logoSize }]}
          />

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="gray"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="gray"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="gray"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="gray"
            value={phoneNo}
            onChangeText={setPhoneNo}
            keyboardType="phone-pad"
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            onPress={handleRegister}
            style={({ pressed }) => [
              styles.registerButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.registerButtonText}>Register</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.loginLink,
              { opacity: pressed ? 0.6 : 1 },
            ]}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginLinkText}>
              Already a member? Login here
            </Text>
          </Pressable>
        </CustomCard>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  /* COPIED EXACTLY FROM samplee */
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    justifyContent: "flex-start",
    backgroundColor: "#232423",
  },
  navLogo: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 10,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "gray",
    fontFamily: "Kristi",
    textShadowColor: "black",
    textShadowOffset: { width: 1, height: 5 },
    textShadowRadius: 3,
    flexGrow: 2,
    marginBottom: 15,
  },

  container: {
    flex: 1,
    paddingVertical: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#232423",
  },

  card: {
    alignItems: "center",
    padding: 16,
  },

  input: {
    width: "90%",
    padding: 10,
    marginVertical: 10,
    borderWidth: 3,
    borderColor: "black",
    borderRadius: 17,
    fontFamily: "Kristi",
    fontWeight: "bold",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    color: "gray",
  },

  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },

  registerButton: {
    width: "30%",
    padding: 7,
    marginVertical: 10,
    borderWidth: 2,
    borderRadius: 17,
    borderColor: "black",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
  },

  registerButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Kristi",
    color: "gray",
  },

  pressed: {
    opacity: 0.7,
  },

  loginLink: {
    marginTop: 12,
    padding: 8,
  },
  loginLinkText: {
    marginTop: 10,
    color: "rgba(0, 0, 0, 5)",
    fontFamily: "Kristi",
    fontWeight: "bold",
    textAlign: "center",
  },

  regLogo: {
    marginBottom: 15,
  },
});
