import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  useWindowDimensions,
  TouchableOpacity,
  Animated,
  Modal,
  ActivityIndicator,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Logo from "../assets/Logo.png"; // your logo

export default function HomeScreen({ navigation, user, setUser }) {
  const { width } = useWindowDimensions();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarPosition = useState(new Animated.Value(-220))[0];

  const isMobile = width < 600;

  const [logoutModal, setLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
    Animated.timing(sidebarPosition, {
      toValue: isSidebarOpen ? -220 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    setTimeout(async () => {
      setLogoutLoading(false);
      setLogoutModal(false);
      await AsyncStorage.removeItem("user");
      setUser(null);
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }, 3000);
  };

  return (
    <SafeAreaView
      style={[styles.wrapper, isMobile && { flexDirection: "column" }]}
    >
      {/* MOBILE NAVBAR */}
      {isMobile && (
        <View style={styles.navbar}>
          <View style={styles.navLeft}>
            <Image source={Logo} style={styles.navLogo} />
            <Text style={styles.navTitle}>THE EJIE BARBERSHOP</Text>
          </View>

          <TouchableOpacity onPress={toggleSidebar} style={styles.hamburger}>
            <View style={styles.hamburgerLine}></View>
            <View style={styles.hamburgerLine}></View>
            <View style={styles.hamburgerLine}></View>
          </TouchableOpacity>
        </View>
      )}

      {/* SIDEBAR */}
      {isMobile ? (
        <Animated.View
          style={[
            styles.sidebar,
            { transform: [{ translateX: sidebarPosition }] },
          ]}
        >
          <View style={styles.sidebarLogoRow}>
            <Image source={Logo} style={styles.sidebarLogoInline} />
            <Text style={styles.sidebarTitleInline}>THE EJIE BARBERSHOP</Text>
          </View>

          <Pressable
            style={styles.sidebarBtn}
            onPress={() => navigation.navigate("Profile", { user })}
          >
            <Text style={styles.sidebarText}>Profile</Text>
          </Pressable>

          <Pressable
            style={styles.sidebarBtn}
            onPress={() => navigation.navigate("Booking", { user })}
          >
            <Text style={styles.sidebarText}>Book a Haircut</Text>
          </Pressable>

          <Pressable
            style={[styles.sidebarBtn, styles.logoutBtn]}
            onPress={() => setLogoutModal(true)}
          >
            <Text style={[styles.sidebarText, { color: "#e5e5e5" }]}>
              Logout
            </Text>
          </Pressable>
        </Animated.View>
      ) : (
        <View style={styles.sidebar}>
          <View style={styles.sidebarLogoRow}>
            <Image source={Logo} style={styles.sidebarLogoInline} />
            <Text style={styles.sidebarTitleInline}>THE EJIE BARBERSHOP</Text>
          </View>

          <Pressable
            style={styles.sidebarBtn}
            onPress={() => navigation.navigate("Profile", { user })}
          >
            <Text style={styles.sidebarText}>Profile</Text>
          </Pressable>

          <Pressable
            style={styles.sidebarBtn}
            onPress={() => navigation.navigate("Booking", { user })}
          >
            <Text style={styles.sidebarText}>Book a Haircut</Text>
          </Pressable>

          <Pressable
            style={[styles.sidebarBtn, styles.logoutBtn]}
            onPress={() => setLogoutModal(true)}
          >
            <Text style={[styles.sidebarText, { color: "#e5e5e5" }]}>
              Logout
            </Text>
          </Pressable>
        </View>
      )}

      {/* MAIN CONTENT */}
      <View style={[styles.content, { marginLeft: isMobile ? 0 : 220 }]}>
        <Text style={styles.welcome}>Welcome back, {user?.name}! 👋</Text>
        <Text style={styles.subtitle}>
          Manage your bookings and profile easily.
        </Text>

        <View style={[styles.cardRow, isMobile && styles.cardColumn]}>
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate("Profile", { user })}
          >
            <Text style={styles.cardTitle}> Profile</Text>
            <Text style={styles.cardDesc}>View and edit your details</Text>
          </Pressable>

          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate("Booking", { user })}
          >
            <Text style={styles.cardTitle}> Book a Haircut</Text>
            <Text style={styles.cardDesc}>Schedule your next haircut</Text>
          </Pressable>
        </View>
      </View>

      {/* LOGOUT MODAL */}
      <Modal transparent visible={logoutModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              isMobile ? { width: "80%" } : { width: 400 },
            ]}
          >
            {logoutLoading ? (
              <View style={{ alignItems: "center" }}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={{ marginTop: 15, fontSize: 16 }}>
                  Logging out...
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.modalText}>
                  Are you sure you want to log out?
                </Text>
                <View style={styles.modalActions}>
                  <Pressable
                    style={[styles.modalButton, { backgroundColor: "#757D75" }]}
                    onPress={handleLogout}
                  >
                    <Text style={styles.modalButtonText}>Yes</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.modalButton, { backgroundColor: "#232423" }]}
                    onPress={() => setLogoutModal(false)}
                  >
                    <Text style={styles.modalButtonText}>No</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ============= STYLES ============= */

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#232423",
  },

  /* Navbar */
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#232423",
  },
  navLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  navLogo: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#e5e5e5",
    fontFamily: "Kristi",
    textShadowColor: "black",
    textShadowOffset: { width: 1, height: 4 },
    textShadowRadius: 4,
  },

  hamburger: {
    width: 30,
    height: 20,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hamburgerLine: {
    width: "100%",
    height: 4,
    backgroundColor: "#fff",
    borderRadius: 2,
  },

  /* Sidebar */
  sidebar: {
    width: 220,
    backgroundColor: "#5B6059",
    paddingVertical: 45,
    paddingHorizontal: 20,
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 10,
    borderRightWidth: 3,
    borderRightColor: "black",
  },

  sidebarLogoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  sidebarLogoInline: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  sidebarTitleInline: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#eee",
    fontFamily: "Kristi",
  },

  sidebarBtn: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#404740ff",
  },
  sidebarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e5e5e5",
    fontFamily: "Kristi",
  },
  logoutBtn: {
    backgroundColor: "#404740ff",
    color: "#e5e5e5",
    marginTop: "auto",
  },

  /* Main Content */
  content: {
    flex: 1,
    padding: 25,
  },
  welcome: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "Kristi",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#ddd",
    fontFamily: "Kristi",
    marginBottom: 25,
  },

  /* Cards */
  cardRow: {
    flexDirection: "row",
    gap: 15,
  },
  cardColumn: {
    flexDirection: "column",
  },
  card: {
    flex: 1,
    minWidth: 160,
    backgroundColor: "#5B6059",
    padding: 20,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: "#444",
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 20,
    color: "#fff",
    fontFamily: "Kristi",
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 16,
    color: "#eee",
    fontFamily: "Kristi",
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#5B6059",
    borderRadius: 12,
    padding: 20,
  },
  modalText: {
    fontSize: 16,
    color: "#fcfcfcff",
    marginBottom: 20,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
