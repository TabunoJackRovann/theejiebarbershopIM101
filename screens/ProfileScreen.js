import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  useWindowDimensions,
  Image,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  Modal,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen({ route, navigation }) {
  const { width } = useWindowDimensions();
  const [userData, setUserData] = useState(route.params.user);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // Filter state

  const isMobile = width < 800;

  // Sidebar toggle state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarPosition = useState(new Animated.Value(-220))[0];

  // Logout modal state
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
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    }, 3000);
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1/barbershop_apii/get_user_bookings.php?user_id=${userData.user_id}` // mao ni tong get_user_bookings.php 
        );                                                                                     // pang profile lang, lahi tong nasa dashboard
        if (res.data.success) {
          setUserData(res.data.user);
          setBookings(res.data.bookings || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Filter and sort bookings
  const filteredBookings = bookings
    .filter((b) => filter === "all" || b.status === filter)
    .sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      return 0;
    });

  return (
    <SafeAreaView style={styles.wrapper}>
      {/* Mobile Navbar */}
      {isMobile && (
        <View style={styles.navbar}>
          <Text style={styles.brand}> Profile</Text>
          <TouchableOpacity onPress={toggleSidebar} style={styles.hamburger}>
            <View style={styles.hamburgerLine}></View>
            <View style={styles.hamburgerLine}></View>
            <View style={styles.hamburgerLine}></View>
          </TouchableOpacity>
        </View>
      )}

      {/* Sidebar */}
      {isMobile ? (
        <Animated.View
          style={[
            styles.sidebar,
            { transform: [{ translateX: sidebarPosition }] },
          ]}
        >
          <Pressable
            style={styles.sidebarBtn}
            onPress={() => navigation.navigate("Home", { user: userData })}
          >
            <Text style={styles.sidebarText}> Home</Text>
          </Pressable>

          <Pressable
            style={styles.sidebarBtn}
            onPress={() => navigation.navigate("Booking", { user: userData })}
          >
            <Text style={styles.sidebarText}> Book a Haircut</Text>
          </Pressable>

          <Pressable
            style={[
              styles.sidebarBtn,
              { backgroundColor: "#5B6059", marginTop: "auto" },
            ]}
            onPress={() => setLogoutModal(true)}
          >
            <Text style={[styles.sidebarText, { color: "#fff" }]}> Logout</Text>
          </Pressable>
        </Animated.View>
      ) : (
        <View style={styles.webSidebar}>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Image
              source={{
                uri:
                  userData.avatar ||
                  "https://i.pinimg.com/originals/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg",
              }}
              style={styles.webAvatar}
            />
            <Text style={[styles.userName, { color: "#fff" }]}>
              {userData.name}
            </Text>
            <Text style={[styles.userPhone, { color: "#D1D5DB" }]}>
              {userData.phoneNo || "Not set"}
            </Text>

            <Pressable style={styles.webBtnEditProf}>
              <Text style={styles.webBtnText}> Edit Profile</Text>
            </Pressable>
            <Pressable
              style={[styles.webBtn, styles.backHomeBtn]}
              onPress={() => navigation.navigate("Home", { user: userData })}
            >
              <Text style={[styles.webBtnText, { color: "#fff" }]}>
                {" "}
                Back to Home
              </Text>
            </Pressable>
          </View>

          <Pressable
            style={[
              styles.webBtn,
              { backgroundColor: "#404740ff", marginTop: 20 },
            ]}
            onPress={() => setLogoutModal(true)}
          >
            <Text style={[styles.webBtnText, { color: "#fff" }]}> Logout</Text>
          </Pressable>
        </View>
      )}

      {/* Content */}
      <View style={[styles.content, { marginLeft: isMobile ? 0 : 50 }]}>
        {isMobile ? (
          <ScrollView contentContainerStyle={styles.mobileContainer}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={{
                    uri:
                      userData.avatar ||
                      "https://i.pinimg.com/originals/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg",
                  }}
                  style={styles.avatar}
                />
              </View>
              <Text style={styles.userName}>{userData.name}</Text>
              <Text style={styles.userPhone}>
                {" "}
                {userData.phoneNo || "Not set"}
              </Text>

              <View style={styles.actionRow}>
                <Pressable style={styles.actionBtn}>
                  <Text style={styles.actionText}> Edit Profile</Text>
                </Pressable>
              </View>
            </View>

            {/* Filter Buttons */}
            {/* Filter Buttons */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 10, gap: 10 }}
            >
              {["all", "pending", "completed", "cancelled", "missed"].map(
                (f) => (
                  <Pressable
                    key={f}
                    onPress={() => setFilter(f)}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 12,
                      backgroundColor: filter === f ? "#3498db" : "#232423",
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "600",
                        textTransform: "capitalize",
                      }}
                    >
                      {f}
                    </Text>
                  </Pressable>
                )
              )}
            </ScrollView>

            <Text style={styles.sectionTitle}> Booking History</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#3498db" />
            ) : filteredBookings.length === 0 ? (
              <Text style={styles.noBookingText}>No bookings yet</Text>
            ) : (
              filteredBookings.map((b, i) => (
                <View key={i} style={styles.bookingCard}>
                  <View
                    style={[
                      styles.statusTag,
                      b.status === "pending"
                        ? { backgroundColor: "#f39c12" }
                        : b.status === "completed"
                        ? { backgroundColor: "#2ecc71" }
                        : { backgroundColor: "#e74c3c" },
                    ]}
                  >
                    <Text style={styles.statusTagText}>{b.status}</Text>
                  </View>
                  <Text style={styles.cardText}>📌 {b.appointment_id}</Text>
                  <Text style={styles.cardText}>
                    📅 {b.appointment_date} | ⏰ {b.appointment_time}
                  </Text>
                  <Text style={styles.cardText}>💈 {b.barber_name}</Text>
                  <Text style={styles.cardText}>
                    ✂️ {b.services.join(", ")}
                  </Text>
                  <Text style={styles.cardText}>💵 ₱{b.total_amount ?? 0}</Text>
                </View>
              ))
            )}
          </ScrollView>
        ) : (
          <View style={styles.webBookings}>
            {/* Filter Buttons (Web) */}
            <View
              style={{
                flexDirection: "row",
                marginBottom: 15,
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              {["all", "pending", "completed", "cancelled", "missed"].map(
                (f) => (
                  <Pressable
                    key={f}
                    onPress={() => setFilter(f)}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 12,
                      backgroundColor: filter === f ? "#3498db" : "#232423",
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "600",
                        textTransform: "capitalize",
                      }}
                    >
                      {f}
                    </Text>
                  </Pressable>
                )
              )}
            </View>

            <Text style={styles.sectionTitle}> Booking History</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#3498db" />
            ) : filteredBookings.length === 0 ? (
              <Text style={styles.noBookingText}>No bookings yet</Text>
            ) : (
              <ScrollView contentContainerStyle={styles.grid}>
                {filteredBookings.map((b, i) => (
                  <View key={i} style={styles.bookingCardWeb}>
                    <View
                      style={[
                        styles.statusTag,
                        b.status === "pending"
                          ? { backgroundColor: "#f39c12" }
                          : b.status === "completed"
                          ? { backgroundColor: "#2ecc71" }
                          : { backgroundColor: "#e74c3c" },
                      ]}
                    >
                      <Text style={styles.statusTagText}>{b.status}</Text>
                    </View>
                    <Text style={styles.cardText}>📌 {b.appointment_id}</Text>
                    <Text style={styles.cardText}>
                      📅 {b.appointment_date} | ⏰ {b.appointment_time}
                    </Text>
                    <Text style={styles.cardText}>💈 {b.barber_name}</Text>
                    <Text style={styles.cardText}>
                      ✂️ {b.services.join(", ")}
                    </Text>
                    <Text style={styles.cardText}>
                      💵 ₱{b.total_amount ?? 0}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        )}
      </View>

      {/* Logout Modal */}
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

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#232423", flexDirection: "row" },
  navbar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    backgroundColor: "#232423",
    zIndex: 20,
    elevation: 5,
  },
  brand: { fontSize: 18, fontWeight: "700", color: "#fff" },
  hamburger: { width: 24, height: 18, justifyContent: "space-between" },
  hamburgerLine: {
    width: "100%",
    height: 2,
    backgroundColor: "#fff",
    borderRadius: 2,
  },

  sidebar: {
    width: 220,
    backgroundColor: "#232423",
    paddingVertical: 45,
    paddingHorizontal: 20,
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 10,
    borderRightWidth: 2,
    borderRightColor: "black",
  },
  sidebarBtn: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#5B6059",
  },
  sidebarText: { fontSize: 15, color: "#fff", fontWeight: "500" },

  webSidebar: {
    width: 280,
    backgroundColor: "#5B6059",
    padding: 25,
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#5B6059",
    justifyContent: "space-between",
    flexDirection: "column",
  },
  webAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "#232423",
  },
  webBtn: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "100%",
    backgroundColor: "#404740ff",
  },
  webBtnEditProf: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "100%",
    backgroundColor: "#404740ff",
  }, //edit prof
  webBtnText: {
    fontSize: 15,
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  backHomeBtn: { marginTop: 12 },

  content: { flex: 1, padding: 20 },
  mobileContainer: { padding: 20, alignItems: "center" },

  profileHeader: {
    alignItems: "center",
    marginBottom: 25,
    backgroundColor: "#5B6059",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    width: "100%",
  },
  avatarWrapper: {
    borderWidth: 3,
    borderColor: "#232423",
    borderRadius: 60,
    padding: 3,
    marginBottom: 12,
  },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  userName: { fontSize: 22, fontWeight: "700", color: "#fff" },
  userPhone: { fontSize: 15, color: "#C7D2FE", marginBottom: 15 },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  actionBtn: {
    backgroundColor: "#232423",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 25,
  },
  actionText: { fontSize: 14, fontWeight: "600", color: "#fff" },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
    color: "#fff",
    alignSelf: "flex-start",
  },
  bookingCard: {
    width: "100%",
    padding: 18,
    backgroundColor: "#5B6059",
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    position: "relative",
  },
  bookingCardWeb: {
    flexBasis: "45%",
    padding: 20,
    backgroundColor: "#5B6059",
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    position: "relative",
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 20 },

  statusTag: {
    position: "absolute",
    right: 10,
    top: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusTagText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  cardText: { fontSize: 15, marginBottom: 5, color: "#fff" },
  noBookingText: {
    textAlign: "center",
    marginTop: 20,
    color: "#C7D2FE",
    fontStyle: "italic",
  },

  webBookings: { flex: 1, padding: 30 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#5B6059",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  modalText: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "500",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: { color: "#fff", fontWeight: "600" },
});
