import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Logo from "../assets/Logo.png"; // same as sample
import CustomCard from "../components/CustomCard"; // reuse sample card

export default function LoginScreen({ navigation, setUser }) {
  const { width } = useWindowDimensions();
  const logoSize = width < 350 ? 100 : width < 420 ? 120 : 150;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setMessage("");

    if (!email || !password) {
      setMessage("Please fill in both email and password");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "https://barbershopapp.infinityfreeapp.com/barbershop_apii/login.php",
        { email, password }
      );

      if (response.data.success && response.data.user) {
        const userObj = response.data.user;
        await AsyncStorage.setItem("user", JSON.stringify(userObj));
        setUser(userObj);

        if (userObj.role === "admin") {
          navigation.reset({ index: 0, routes: [{ name: "Dashboard" }] });
        } else {
          navigation.reset({ index: 0, routes: [{ name: "Home" }] });
        }
      } else {
        setMessage(response.data.message || "Invalid credentials");
      }
    } catch (err) {
      setMessage("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      {/* Top Navbar */}
      <View style={styles.navBar}>
        <Image source={Logo} style={styles.navLogo} />
        <Text style={styles.navTitle}>THE EJIE BARBERSHOP</Text>
      </View>

      {/* Main Login Card */}
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <CustomCard style={[styles.card, { width: width > 420 ? 400 : "90%" }]}>
          <Image
            source={Logo}
            style={[styles.loginLogo, { width: logoSize, height: logoSize }]}
          />

          <TextInput
            placeholder="Email"
            placeholderTextColor="gray"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="gray"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          {loading ? (
            <ActivityIndicator size="large" color="gray" style={{ margin: 10 }} />
          ) : (
            <Pressable style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </Pressable>
          )}

          {message ? <Text style={styles.errorText}>{message}</Text> : null}

          <Pressable onPress={() => navigation.navigate("Register")}>
            <Text style={styles.linkText}>Not a member? Register here</Text>
          </Pressable>
        </CustomCard>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  /* Navbar copied from sample */
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

  /* Main container copied from sample */
  container: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 20,
    alignItems: "center",
    backgroundColor: "#232423",
  },
  card: {
    alignItems: "center",
    padding: 18,
  },

  loginLogo: {
    width: 110,
    height: 110,
    marginBottom: 20,
  },

  /* Inputs styled exactly like sample */
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

  /* Error message same style */
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
    fontFamily: "Kristi",
  },

  /* Login button from sample */
  loginButton: {
    width: "30%",
    padding: 7,
    marginVertical: 10,
    borderWidth: 2,
    borderRadius: 17,
    borderColor: "black",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Kristi",
    color: "gray",
  },

  /* Register link copied from sample */
  linkText: {
    marginTop: 10,
    color: "rgba(0, 0, 0, 5)",
    fontFamily: "Kristi",
    fontWeight: "bold",
    textAlign: "center",
  },
});
