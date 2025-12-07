import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Alert,
  Modal,
  SafeAreaView,
  useWindowDimensions,
  TouchableOpacity,
  Animated,
  TextInput,
  Switch,
} from "react-native";
import axios from "axios";
import ModalSelector from "react-native-modal-selector";

export default function DashboardScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 800; // if width is less than kani kay mo mobile sya

  const API_BASE = "http://127.0.0.1/barbershop_apii/";

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState({});
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    type: "",
    appointmentId: null,
  });
  const [paymentModal, setPaymentModal] = useState({
    visible: false,
    billingId: null,
    appointmentId: null,
  });
  const [statusFilter, setStatusFilter] = useState("All");
  const [logoutModal, setLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  // BARBERS MANAGEMENT
  const [barbers, setBarbers] = useState([]);
  const [barbersLoading, setBarbersLoading] = useState(true);
  const [manageBarbersVisible, setManageBarbersVisible] = useState(false);
  const [newBarberName, setNewBarberName] = useState("");
  const [editingBarberId, setEditingBarberId] = useState(null);
  const [editingBarberName, setEditingBarberName] = useState("");
  const [barberActionLoading, setBarberActionLoading] = useState(false);

  // sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarPosition = useState(new Animated.Value(-240))[0];
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
    Animated.timing(sidebarPosition, {
      toValue: isSidebarOpen ? -240 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  // Fetch all bookings
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE + "get_all_bookings.php");  // get_all_bookings.php mao ni sa tanan bookings, lahi tong sa profile
      if (res.data.success) setBookings(res.data.bookings || []);      // pang dashboard rani sya
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  // Fetch barbers for management and for any UI needs
  const fetchBarbers = async () => {
    setBarbersLoading(true);
    try {
      const res = await axios.get(API_BASE + "get_barbers.php");
      // get_barbers returns array
      let list = [];
      if (Array.isArray(res.data)) {
        list = res.data;
      } else if (res.data && Array.isArray(res.data.barbers)) {
        list = res.data.barbers;
      } else {
        list = [];
      }

      // normalize availability field (backend may or may not send it)
      const normalized = list.map((b) => ({
        barber_id: Number(b.barber_id),
        name: b.name ?? b.barber_name ?? `Barber ${b.barber_id}`,
        availability: b.hasOwnProperty("availability")
          ? Number(b.availability)
          : 1,
      }));
      setBarbers(normalized);
    } catch (err) {
      console.error("Failed to fetch barbers", err);
      setBarbers([]);
    } finally {
      setBarbersLoading(false);
    }
  };

  const updateStatus = async (appointment_id, newStatus) => {
    try {
      await axios.post(API_BASE + "update_booking_status.php", {
        appointment_id,
        status: newStatus,
      });
      fetchBookings();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update status");
    }
  };

  const savePayment = async (billing_id, appointment_id) => {
    try {
      const method = paymentMethods[billing_id];
      if (!method) {
        Alert.alert("Error", "Please select a payment method first!");
        return;
      }
      const res = await axios.post(API_BASE + "update_payment_method.php", {
        billing_id,
        payment_method: method,
      });
      if (res.data.success) {
        await updateStatus(appointment_id, "completed");
        Alert.alert("Success", "Payment recorded and booking completed!");
      } else {
        Alert.alert("Error", res.data.message);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save payment");
    }
  };

  const handleLogout = () => {
    setLogoutLoading(true);
    setTimeout(() => {
      setLogoutLoading(false);
      setLogoutModal(false);
      navigation.replace("Login");
    }, 3000);
  };

  useEffect(() => {
    fetchBookings();
    fetchBarbers();
  }, []);

  const paymentOptions = [
    { key: 1, label: "GCash" },
    { key: 2, label: "Cash" },
  ];

  const filterOptions = [
    { key: 1, label: "All" },
    { key: 2, label: "Pending" },
    { key: 3, label: "Completed" },
    { key: 4, label: "Cancelled" },
    { key: 5, label: "Missed" },
  ];

  const openConfirmModal = (type, appointmentId) => {
    setConfirmModal({ visible: true, type, appointmentId });
  };

  const confirmAction = () => {
    if (confirmModal.type && confirmModal.appointmentId !== null) {
      updateStatus(confirmModal.appointmentId, confirmModal.type);
    }
    setConfirmModal({ visible: false, type: "", appointmentId: null });
  };

  const confirmPayment = () => {
    if (paymentModal.billingId && paymentModal.appointmentId) {
      const method = paymentMethods[paymentModal.billingId];
      savePayment(paymentModal.billingId, paymentModal.appointmentId);

      // Update UI immediately
      setBookings((prev) =>
        prev.map((b) =>
          b.appointment_id === paymentModal.appointmentId
            ? { ...b, payment_method: method, amount_paid: b.total_amount }
            : b
        )
      );
    }
    setPaymentModal({ visible: false, billingId: null, appointmentId: null });
  };

  const displayedBookings = bookings
    .filter((b) => {
      if (statusFilter === "All") return true;
      return b.status.toLowerCase() === statusFilter.toLowerCase();
    })
    .sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      return 0;
    });

  // ----- BARBER MANAGEMENT ACTIONS -----
  const addBarber = async () => {
    if (!newBarberName.trim()) {
      Alert.alert("Validation", "Please enter a barber name");
      return;
    }
    setBarberActionLoading(true);
    try {
      const res = await axios.post(API_BASE + "add_barber.php", {
        name: newBarberName.trim(),
      });
      if (res.data.success) {
        setNewBarberName("");
        // add to local list - backend expected to return created barber
        const added = res.data.barber
          ? {
              barber_id: Number(res.data.barber.barber_id),
              name: res.data.barber.name,
              availability: res.data.barber.hasOwnProperty("availability")
                ? Number(res.data.barber.availability)
                : 1,
            }
          : {
              barber_id: Date.now(),
              name: newBarberName.trim(),
              availability: 1,
            }; // fallback
        setBarbers((p) => [...p, added]);
        Alert.alert("Success", "Barber added");
      } else {
        Alert.alert("Error", res.data.message || "Failed to add barber");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to add barber");
    } finally {
      setBarberActionLoading(false);
    }
  };

  const startEditBarber = (b) => {
    setEditingBarberId(b.barber_id);
    setEditingBarberName(b.name);
  };

  const cancelEditBarber = () => {
    setEditingBarberId(null);
    setEditingBarberName("");
  };

  const updateBarber = async () => {
    if (!editingBarberName.trim() || !editingBarberId) {
      Alert.alert("Validation", "Please enter a valid name");
      return;
    }
    setBarberActionLoading(true);
    try {
      const res = await axios.post(API_BASE + "update_barber.php", {
        barber_id: editingBarberId,
        name: editingBarberName.trim(),
      });
      if (res.data.success) {
        setBarbers((prev) =>
          prev.map((p) =>
            Number(p.barber_id) === Number(editingBarberId)
              ? { ...p, name: editingBarberName.trim() }
              : p
          )
        );
        cancelEditBarber();
        Alert.alert("Success", "Barber updated");
      } else {
        Alert.alert("Error", res.data.message || "Failed to update barber");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update barber");
    } finally {
      setBarberActionLoading(false);
    }
  };

  const confirmDeleteBarber = async () => {
    if (!deleteBarberModal.barberId) return;

    setBarberActionLoading(true);
    try {
      const res = await axios.post(API_BASE + "delete_barber.php", {
        barber_id: deleteBarberModal.barberId,
      });

      if (res.data.success) {
        setBarbers((prev) =>
          prev.filter(
            (b) => Number(b.barber_id) !== Number(deleteBarberModal.barberId)
          )
        );
        Alert.alert("Deleted", "Barber deleted");
      } else {
        // Log to console if deletion fails due to existing appointments
        if (
          res.data.message &&
          res.data.message.toLowerCase().includes("appointment")
        ) {
          console.warn(
            `Cannot delete barber "${deleteBarberModal.barberName}": ${res.data.message}`
          );
        }
        Alert.alert("Error", res.data.message || "Failed to delete barber");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to delete barber");
    } finally {
      setBarberActionLoading(false);
      setDeleteBarberModal({ visible: false, barberId: null, barberName: "" });
    }
  };

  // Toggle availability - uses update_barber_availability.php
  const toggleAvailability = async (barber_id, newVal) => {
    // newVal is boolean -> backend expects int (1/0)
    setBarberActionLoading(true);
    try {
      const res = await axios.post(
        API_BASE + "update_barber_availability.php",
        {
          barber_id,
          availability: newVal ? 1 : 0,
        }
      );
      if (res.data.success) {
        setBarbers((prev) =>
          prev.map((b) =>
            Number(b.barber_id) === Number(barber_id)
              ? { ...b, availability: newVal ? 1 : 0 }
              : b
          )
        );
      } else {
        Alert.alert(
          "Error",
          res.data.message || "Failed to update availability"
        );
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update availability");
    } finally {
      setBarberActionLoading(false);
    }
  };

  const [deleteBarberModal, setDeleteBarberModal] = useState({
    visible: false,
    barberId: null,
    barberName: "",
  });

  return (
    <SafeAreaView
      style={[styles.wrapper, isMobile && { flexDirection: "column" }]}
    >
      {/* Navbar (mobile) */}
      {isMobile && (
        <View style={styles.navbar}>
          <Text style={styles.brand}>💈 Admin Dashboard</Text>
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
            style={[styles.sidebarBtn, styles.logoutBtn]}
            onPress={() => setLogoutModal(true)}
          >
            <Text style={[styles.sidebarText, { color: "#fff" }]}>Logout</Text>
          </Pressable>

          <Pressable
            style={[styles.sidebarBtn, { marginTop: 8 }]}
            onPress={() => {
              setManageBarbersVisible(true);
              // ensure barbers loaded
              fetchBarbers();
            }}
          >
            <Text style={[styles.sidebarText, { color: "#E5E7EB" }]}>
              Manage Barbers
            </Text>
          </Pressable>
        </Animated.View>
      ) : (
        <View style={styles.sidebar}>
          <Text style={styles.sidebarTitle}>💈 Admin</Text>

          <Pressable
            style={[styles.sidebarBtn, { marginBottom: 12 }]}
            onPress={() => {
              setManageBarbersVisible(true);
              fetchBarbers();
            }}
          >
            <Text style={[styles.sidebarText, { color: "#fff" }]}>
              Manage Barbers
            </Text>
          </Pressable>

          <Pressable
            style={[styles.sidebarBtn, styles.logoutBtn]}
            onPress={() => setLogoutModal(true)}
          >
            <Text style={[styles.sidebarText, { color: "#fff" }]}>Logout</Text>
          </Pressable>
        </View>
      )}

      {/* Content */}
      <View style={[styles.content, { marginLeft: isMobile ? 0 : 240 }]}>
        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 16, fontWeight: "500", marginBottom: 5 }}>
            Filter by Status
          </Text>
          <ModalSelector
            data={filterOptions}
            initValue={statusFilter}
            onChange={(option) => setStatusFilter(option.label)}
            selectStyle={styles.selectStyle}
            selectTextStyle={{
              color: statusFilter !== "All" ? "#111827" : "#9ca3af",
              fontSize: 16,
              fontWeight: "500",
            }}
            optionTextStyle={{ color: "#374151", fontSize: 16 }}
          />
        </View>

        <Text style={styles.subtitle}>All Bookings</Text>

        <View style={styles.bookingContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#000" />
          ) : displayedBookings.length === 0 ? (
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              No bookings found
            </Text>
          ) : (
            <ScrollView>
              {displayedBookings.map((b, i) => (
                <View key={i} style={styles.bookingCard}>
                  <Text style={styles.cardText}>
                    Booking: {b.appointment_id}
                  </Text>
                  <Text style={styles.cardText}>
                    Customer: {b.customer_name}
                  </Text>
                  <Text style={styles.cardText}>Barber: {b.barber_name}</Text>
                  <Text style={styles.cardText}>
                    Date: {b.appointment_date}
                  </Text>
                  <Text style={styles.cardText}>
                    Time: {b.appointment_time}
                  </Text>

                  <Text style={styles.cardText}>
                    Services:{" "}
                    {b.services && b.services.length > 0
                      ? b.services.join(", ")
                      : "No services"}
                  </Text>
                  <Text style={styles.cardText}>
                    {b.payment_method
                      ? `Total Paid: ₱${b.amount_paid ?? b.total_amount}`
                      : `Total: ₱${b.total_amount ?? 0}`}
                  </Text>

                  {/* Payment */}
                  {!b.payment_method &&
                    b.billing_id > 0 &&
                    b.status === "pending" && (
                      <View style={{ marginVertical: 10 }}>
                        <Text style={styles.cardText}>Select Payment:</Text>
                        <ModalSelector
                          data={paymentOptions}
                          initValue={
                            paymentMethods[b.billing_id] || "Select Payment"
                          }
                          onChange={(option) =>
                            setPaymentMethods((prev) => ({
                              ...prev,
                              [b.billing_id]: option.label,
                            }))
                          }
                          selectStyle={styles.selectStyle}
                          selectTextStyle={{
                            color: paymentMethods[b.billing_id]
                              ? "#111827"
                              : "#9ca3af",
                            fontSize: 16,
                            fontWeight: "500",
                          }}
                          optionTextStyle={{ color: "#374151", fontSize: 16 }}
                        />
                        <Pressable
                          style={styles.saveButton}
                          onPress={() =>
                            setPaymentModal({
                              visible: true,
                              billingId: b.billing_id,
                              appointmentId: b.appointment_id,
                            })
                          }
                        >
                          <Text style={styles.saveButtonText}>
                            Save Payment & Complete
                          </Text>
                        </Pressable>
                      </View>
                    )}

                  {/* Status */}
                  <Text
                    style={[
                      styles.cardText,
                      b.status === "pending"
                        ? styles.pending
                        : b.status === "completed"
                        ? styles.completed
                        : b.status === "cancelled"
                        ? styles.cancelled
                        : styles.missed,
                    ]}
                  >
                    Status: {b.status}
                  </Text>

                  {b.status === "pending" && (
                    <View style={styles.actions}>
                      <Pressable
                        style={[
                          styles.actionButton,
                          { backgroundColor: "#374151" },
                        ]}
                        onPress={() =>
                          openConfirmModal("missed", b.appointment_id)
                        }
                      >
                        <Text style={styles.actionText}>Mark as missed</Text>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.actionButton,
                          { backgroundColor: "#374151" },
                        ]}
                        onPress={() =>
                          openConfirmModal("cancelled", b.appointment_id)
                        }
                      >
                        <Text style={styles.actionText}>Cancel</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>

      {/* Manage Barbers Modal */}
      <Modal transparent visible={manageBarbersVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.manageModalContent,
              isMobile ? { width: "92%" } : { width: 640 },
            ]}
          >
            <Text style={styles.modalTitle}>Manage Barbers</Text>

            <View style={{ marginBottom: 12 }}>
              <TextInput
                placeholder="New barber name"
                value={newBarberName}
                onChangeText={setNewBarberName}
                style={styles.input}
                placeholderTextColor="#999"
              />
              <Pressable
                style={styles.addBtn}
                onPress={addBarber}
                disabled={barberActionLoading}
              >
                <Text style={styles.addBtnText}>
                  {barberActionLoading ? "Adding..." : "Add Barber"}
                </Text>
              </Pressable>
            </View>

            {barbersLoading ? (
              <ActivityIndicator />
            ) : barbers.length === 0 ? (
              <Text style={{ textAlign: "center", color: "#6B7280" }}>
                No barbers found
              </Text>
            ) : (
              <ScrollView style={{ maxHeight: 340 }}>
                {barbers.map((b) => (
                  <View key={b.barber_id} style={styles.barberRow}>
                    {editingBarberId === b.barber_id ? (
                      <>
                        <TextInput
                          value={editingBarberName}
                          onChangeText={setEditingBarberName}
                          style={[styles.input, { flex: 1 }]}
                        />
                        <Pressable
                          style={styles.saveSmallBtn}
                          onPress={updateBarber}
                          disabled={barberActionLoading}
                        >
                          <Text style={styles.saveSmallBtnText}>Save</Text>
                        </Pressable>
                        <Pressable
                          style={styles.cancelSmallBtn}
                          onPress={cancelEditBarber}
                        >
                          <Text style={styles.cancelSmallBtnText}>Cancel</Text>
                        </Pressable>
                      </>
                    ) : (
                      <>
                        <Text style={styles.barberName}>{b.name}</Text>

                        <View
                          style={{
                            flexDirection: "row",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          {/* Availability Switch */}
                          <View
                            style={{ alignItems: "center", marginRight: 8 }}
                          >
                            <Text
                              style={{
                                fontSize: 12,
                                color: b.availability ? "#059669" : "#B91C1C",
                                marginBottom: 2,
                              }}
                            >
                              {b.availability ? "Available" : "Unavailable"}
                            </Text>
                            <Switch
                              value={!!b.availability}
                              onValueChange={(val) =>
                                toggleAvailability(b.barber_id, val)
                              }
                              disabled={barberActionLoading}
                            />
                          </View>

                          <Pressable
                            style={styles.editSmallBtn}
                            onPress={() => startEditBarber(b)}
                          >
                            <Text style={styles.editSmallBtnText}>Edit</Text>
                          </Pressable>
                          <Pressable
                            style={styles.deleteSmallBtn}
                            onPress={() =>
                              setDeleteBarberModal({
                                visible: true,
                                barberId: b.barber_id,
                                barberName: b.name,
                              })
                            }
                          >
                            <Text style={styles.deleteSmallBtnText}>
                              Delete
                            </Text>
                          </Pressable>
                        </View>
                      </>
                    )}
                  </View>
                ))}
              </ScrollView>
            )}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginTop: 12,
              }}
            >
              <Pressable
                style={[styles.modalButton, { backgroundColor: "#9CA3AF" }]}
                onPress={() => setManageBarbersVisible(false)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modals (confirm/payment/logout) */}
      <Modal transparent visible={confirmModal.visible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              isMobile ? { width: "80%" } : { width: 400 },
            ]}
          >
            <Text style={styles.modalText}>
              Are you sure you want to mark this booking as {confirmModal.type}?
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: "#374151" }]}
                onPress={confirmAction}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: "#25292fff" }]}
                onPress={() =>
                  setConfirmModal({
                    visible: false,
                    type: "",
                    appointmentId: null,
                  })
                }
              >
                <Text style={styles.modalButtonText}>No</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={paymentModal.visible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              isMobile ? { width: "80%" } : { width: 400 },
            ]}
          >
            <Text style={styles.modalText}>
              By clicking Yes, the selected payment will be saved and the
              booking will be marked as completed.
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: "#374151" }]}
                onPress={confirmPayment}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: "#25292fff" }]}
                onPress={() =>
                  setPaymentModal({
                    visible: false,
                    billingId: null,
                    appointmentId: null,
                  })
                }
              >
                <Text style={styles.modalButtonText}>No</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={deleteBarberModal.visible}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              isMobile ? { width: "80%" } : { width: 400 },
            ]}
          >
            <Text style={styles.modalText}>
              Are you sure you want to delete barber "
              {deleteBarberModal.barberName}"?
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: "#e74c3c" }]}
                onPress={confirmDeleteBarber}
              >
                <Text style={styles.modalButtonText}>Yes, Delete</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: "#9CA3AF" }]}
                onPress={() =>
                  setDeleteBarberModal({
                    visible: false,
                    barberId: null,
                    barberName: "",
                  })
                }
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
                <ActivityIndicator size="large" color="#dcd8d8ff" />
                <Text
                  style={{ marginTop: 15, fontSize: 16, color: "#dcd8d8ff" }}
                >
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
                    style={[styles.modalButton, { backgroundColor: "#374151" }]}
                    onPress={handleLogout}
                  >
                    <Text style={styles.modalButtonText}>Yes</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.modalButton,
                      { backgroundColor: "#25292fff" },
                    ]}
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
  wrapper: { flex: 1, flexDirection: "row", backgroundColor: "#F9FAFB" },

  /* Navbar (mobile) */
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#111827",
  },
  brand: { fontSize: 20, fontWeight: "700", color: "#fff" },
  hamburger: { width: 28, height: 20, justifyContent: "space-between" },
  hamburgerLine: {
    width: "100%",
    height: 3,
    backgroundColor: "#fff",
    borderRadius: 2,
  },

  /* Sidebar */
  sidebar: {
    width: 240,
    backgroundColor: "#232423",
    paddingVertical: 30,
    paddingHorizontal: 15,
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 10,
  },
  sidebarTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 30,
  },
  sidebarBtn: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#374151",
  },
  sidebarText: { fontSize: 15, color: "#E5E7EB", fontWeight: "500" },
  logoutBtn: { backgroundColor: "#374151", marginTop: "auto" },

  /* Content */
  content: { flex: 1, padding: 20 },
  subtitle: { fontSize: 22, fontWeight: "600", marginBottom: 10 },
  bookingContainer: { flex: 1 },
  bookingCard: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardText: { fontSize: 15, marginBottom: 4, color: "#111827" },
  pending: { color: "#f39c12", fontWeight: "bold" },
  completed: { color: "#2ecc71", fontWeight: "bold" },
  cancelled: { color: "#e74c3c", fontWeight: "bold" },
  missed: { color: "#e74c3c", fontWeight: "bold" },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
  },
  actionText: { color: "#fff", fontWeight: "bold", fontSize: 14 },

  saveButton: {
    marginTop: 10,
    backgroundColor: "#25292fff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 15 },

  selectStyle: {
    backgroundColor: "#fff",
    borderColor: "#d1d5db",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // dim background
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#232423",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  manageModalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },

  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#F9FAFB",
  },
  addBtn: {
    backgroundColor: "#25292fff",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  addBtnText: { color: "#fff", fontWeight: "700" },

  barberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  barberName: { fontSize: 16, color: "#111827", flex: 1 },

  editSmallBtn: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  editSmallBtnText: { color: "#111827", fontWeight: "600" },

  deleteSmallBtn: {
    backgroundColor: "#FEE2E2",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  deleteSmallBtnText: { color: "#B91C1C", fontWeight: "700" },

  saveSmallBtn: {
    backgroundColor: "#10B981",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  saveSmallBtnText: { color: "#fff", fontWeight: "700" },

  cancelSmallBtn: {
    backgroundColor: "#E5E7EB",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginLeft: 6,
  },
  cancelSmallBtnText: { color: "#111827", fontWeight: "700" },

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
  cancelButton: {
    backgroundColor: "#9CA3AF", // Gray
  },
  confirmButton: {
    backgroundColor: "#EF4444", // Red
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  modalText: {
    fontSize: 16,
    color: "#c9cbd0ff",
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "500",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalText: {
    fontSize: 16,
    color: "#c4c7cdff",
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "500",
  },

  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
