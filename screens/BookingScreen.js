import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
  useWindowDimensions,
  Platform,
  Image,
} from "react-native";
import { Calendar } from "react-native-calendars";
import axios from "axios";
import Logo from "../assets/Logo.png";

export default function BookingScreen({ navigation, route }) {
  const user = route?.params?.user ?? { id: null };
  const API_BASE = "http://127.0.0.1/barbershop_apii/"; // https://barbershopapp.infinityfreeapp.com/barbershop_apii/login.php <- hosting unta pero naa may bayad

  const { width } = useWindowDimensions();
  const isMobile = width < 720 || Platform.OS !== "web";
  const contentMax = Math.min(1120, width);

  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedBarberId, setSelectedBarberId] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alreadyBooked, setAlreadyBooked] = useState(false);
  const [totalAmount, setTotalAmount] = useState(100);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCancelledSuccess, setShowCancelledSuccess] = useState(false);

  const [slotTaken, setSlotTaken] = useState(false); //if a slot is taken, di na siya pwede lods, koofal kaba?

  useEffect(() => {
    const checkSlot = async () => {
      if (!selectedBarberId || !selectedDate || !selectedTime) {
        setSlotTaken(false);
        return;
      }
      try {
        const res = await axios.get(
          API_BASE +
            `check_slot.php?barber_id=${selectedBarberId}&appointment_date=${selectedDate}&appointment_time=${selectedTime}`
        );

        // Only mark as taken if a pending booking exists
        setSlotTaken(!res.data.available);
      } catch (err) {
        console.error("Slot check error", err);
        setSlotTaken(false); // default false on error
      }
    };

    checkSlot();
  }, [selectedBarberId, selectedDate, selectedTime, showCancelledSuccess]);

  const timeSlots = ["10:30 AM", "1:00 PM", "3:00 PM", "5:00 PM"];

  const BASE_FEE = 100;
  const SERVICE_PRICES = {
    haircut: 120,
    shaving: 60,
    "beard trim": 75,
  };

  const normalizeName = (name) => (name || "").trim().toLowerCase();
  const priceForServiceName = (name) =>
    SERVICE_PRICES[normalizeName(name)] ?? 0;

  useEffect(() => {
    fetchBarbers();
    fetchServices();
    if (user?.user_id || user?.id) checkIfBooked();
  }, []);

  useEffect(() => {
    if (selectedBarberId == null) return;
    const sel = barbers.find(
      (b) => Number(b.barber_id) === Number(selectedBarberId)
    );
    if (sel) {
      const isUnavailable =
        sel.availability === 0 ||
        sel.availability === "0" ||
        sel.available === 0 ||
        sel.available === "false";
      if (isUnavailable) {
        setSelectedBarberId(null);
      }
    }
  }, [barbers]);

  useEffect(() => {
    calculateTotal();
  }, [selectedServices, services]);

  const calculateTotal = () => {
    let total = BASE_FEE;
    selectedServices.forEach((sid) => {
      const serv = services.find((s) => Number(s.service_id) === Number(sid));
      if (serv) total += priceForServiceName(serv.serv_name);
    });
    setTotalAmount(total);
  };

  const fetchBarbers = async () => {
    try {
      const res = await axios.get(API_BASE + "get_barbers.php");
      if (Array.isArray(res.data) && res.data.length > 0) {
        const normalized = res.data.map((b) => ({
          ...b,
          availability:
            b.availability !== undefined
              ? typeof b.availability === "string"
                ? b.availability === "1"
                  ? 1
                  : 0
                : Number(b.availability || 0)
              : 1,
        }));
        setBarbers(normalized);
      } else {
        setBarbers([
          { barber_id: 1, name: "Barber 1", availability: 1 },
          { barber_id: 2, name: "Barber 2", availability: 1 },
          { barber_id: 3, name: "Barber 3", availability: 1 },
        ]);
      }
    } catch (err) {
      console.error(err);
      setBarbers([
        { barber_id: 1, name: "Barber 1", availability: 1 },
        { barber_id: 2, name: "Barber 2", availability: 1 },
        { barber_id: 3, name: "Barber 3", availability: 1 },
      ]);
    }
  };

  const checkSlotAvailability = async () => {
    if (!selectedBarberId || !selectedDate || !selectedTime) return true; // incomplete info
    try {
      const res = await axios.get(
        API_BASE +
          `check_slot.php?barber_id=${selectedBarberId}&appointment_date=${selectedDate}&appointment_time=${selectedTime}`
      );
      return res.data.available;
    } catch (err) {
      console.error("Slot check error", err);
      return true; // allow booking if server fails
    }
  };

  const fetchServices = async () => {
    try {
      const res = await axios.get(API_BASE + "get_services.php");
      if (Array.isArray(res.data) && res.data.length > 0) {
        setServices(res.data);
      } else {
        setServices([
          { service_id: 1, serv_name: "Haircut" },
          { service_id: 2, serv_name: "Beard Trim" },
          { service_id: 3, serv_name: "Shaving" },
        ]);
      }
    } catch (err) {
      console.error(err);
      setServices([
        { service_id: 1, serv_name: "Haircut" },
        { service_id: 2, serv_name: "Beard Trim" },
        { service_id: 3, serv_name: "Shaving" },
      ]);
    }
  };

  const toggleService = (id) => {
    const numericId = Number(id);
    setSelectedServices((prev) =>
      prev.includes(numericId)
        ? prev.filter((x) => x !== numericId)
        : [...prev, numericId]
    );
  };

  const toggleBarber = (id) => {
    const b = barbers.find((x) => Number(x.barber_id) === Number(id));
    const isUnavailable =
      b &&
      (b.availability === 0 || b.availability === "0" || b.available === 0);
    if (isUnavailable) return;
    setSelectedBarberId((prev) =>
      Number(prev) === Number(id) ? null : Number(id)
    );
  };

  const checkIfBooked = async () => {
    try {
      const uid = user.user_id ?? user.id;
      const res = await axios.get(
        API_BASE + `check_booking.php?user_id=${uid}`
      );
      setAlreadyBooked(!!res.data.alreadyBooked);
    } catch (err) {
      console.error("Error checking booking", err);
      setAlreadyBooked(false);
    }
  };

  const handleBookNow = async () => {
    if (!user?.user_id && !user?.id) {
      Alert.alert("Not logged in", "You must be logged in to book.");
      return;
    }

    if (!selectedBarberId) {
      return Alert.alert("Select barber", "Please select a barber.");
    }

    if (selectedServices.length === 0) {
      return Alert.alert(
        "Select service",
        "Please select at least one service."
      );
    }

    if (!selectedDate) {
      return Alert.alert("Select date", "Please choose a date.");
    }

    if (!selectedTime) {
      return Alert.alert("Select time", "Please choose a time slot.");
    }

    setLoading(true);

    try {
      const userId = Number(user.user_id ?? user.id);

      // ✅ 1. Check if user already has a pending booking
      const userBookingRes = await axios.get(
        API_BASE + `check_booking.php?user_id=${userId}`
      );
      if (userBookingRes.data.alreadyBooked) {
        setLoading(false);
        return Alert.alert(
          "Already Booked",
          "You already have a pending booking."
        );
      }

      // ✅ 2. Check if selected slot is available
      const slotRes = await axios.get(
        API_BASE +
          `check_slot.php?barber_id=${selectedBarberId}&appointment_date=${selectedDate}&appointment_time=${selectedTime}`
      );
      if (!slotRes.data.available) {
        setLoading(false);
        return Alert.alert(
          "Slot Taken",
          "This barber is already booked at the selected date/time."
        );
      }

      // ✅ 3. Proceed to create booking
      const payload = {
        user_id: userId,
        barber_id: Number(selectedBarberId),
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        services: selectedServices.map((s) => Number(s)),
        total_amount: totalAmount,
      };

      const res = await axios.post(API_BASE + "book_appointment.php", payload, {
        headers: { "Content-Type": "application/json" },
      });

      setLoading(false);

      if (res.data.success) {
        setShowSuccessModal(true);
        setAlreadyBooked(true);
      } else {
        Alert.alert("❌ Booking failed", res.data.message || "Try again later");
      }
    } catch (err) {
      setLoading(false);
      console.error("Booking error", err);
      Alert.alert("Error", "Could not create booking. Check server logs.");
    }
  };

  const handleCancelBooking = async () => {
    setShowCancelModal(false);
    try {
      const res = await fetch(API_BASE + "cancel_booking.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.user_id ?? user.id }),
      });
      const data = await res.json();
      if (data.success) {
        setAlreadyBooked(false);
        setShowCancelledSuccess(true);
      } else {
        Alert.alert(
          "Cancel Failed",
          data.message || "Failed to cancel booking."
        );
      }
    } catch (error) {
      console.error("Cancel booking error:", error);
      Alert.alert("Error", "Could not cancel booking. Try again later.");
    }
  };

  const markedDates = selectedDate
    ? { [selectedDate]: { selected: true, selectedColor: "#404740ff" } }
    : {};

  const isReadyToBook = () =>
    (user?.user_id || user?.id) &&
    selectedBarberId &&
    selectedServices.length > 0 &&
    selectedDate &&
    selectedTime;

  return (
    <View style={[styles.page, { alignItems: "center" }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { width: contentMax, paddingBottom: isMobile ? 96 : 32 },
        ]}
      >
        <View style={styles.headerRow}>
          {!isMobile && (
            <View style={styles.logoWrapper}>
              <Image source={Logo} style={styles.navLogo} />
              <Text style={styles.logoText}>THE EJIE BARBERSHOP</Text>
            </View>
          )}
          <Text style={styles.pageTitle}>Book Appointment</Text>
          <Pressable
            onPress={() => navigation.navigate("Home")}
            style={styles.linkBtn}
          >
            <Text style={styles.linkBtnText}>← Back to Home</Text>
          </Pressable>
        </View>

        <View style={[styles.grid, isMobile && styles.gridMobile]}>
          <View style={[styles.col, styles.colMain]}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Choose a barber </Text>
              <View style={styles.rowWrap}>
                {barbers.map((b) => {
                  const selected =
                    Number(selectedBarberId) === Number(b.barber_id);
                  const isUnavailable =
                    b.availability === 0 ||
                    b.availability === "0" ||
                    b.available === 0 ||
                    b.available === "false" ||
                    b.available === "0";

                  return (
                    <Pressable
                      key={b.barber_id}
                      onPress={() => toggleBarber(b.barber_id)}
                      disabled={isUnavailable}
                      style={[
                        styles.chip,
                        selected && styles.chipSelected,
                        isUnavailable && styles.chipUnavailable,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selected && styles.chipTextSelected,
                          isUnavailable && styles.chipTextUnavailable,
                          isUnavailable && {
                            textDecorationLine: "line-through",
                          },
                        ]}
                      >
                        {b.name ?? b.barber_name ?? `Barber ${b.barber_id}`}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Services */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Choose service(s) </Text>
              <View style={styles.rowWrap}>
                {services.map((s) => {
                  const selected = selectedServices.includes(
                    Number(s.service_id)
                  );
                  return (
                    <Pressable
                      key={s.service_id}
                      onPress={() => toggleService(s.service_id)}
                      style={[styles.chip, selected && styles.chipSelected]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selected && styles.chipTextSelected,
                        ]}
                      >
                        {s.serv_name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Date */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Pick a date </Text>
              <Calendar
                onDayPress={(day) => setSelectedDate(day.dateString)}
                markedDates={markedDates}
                minDate={new Date().toISOString().split("T")[0]}
                theme={{
                  selectedDayBackgroundColor: "#4F46E5",
                  todayTextColor: "#4F46E5",
                  arrowColor: "#111827",
                }}
                style={{ borderRadius: 12, overflow: "hidden" }}
              />
            </View>

            {/* Time */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Pick a time </Text>
              <View style={styles.rowWrap}>
                {timeSlots.map((t) => {
                  const selected = selectedTime === t;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => setSelectedTime(t)}
                      style={[
                        styles.timeChip,
                        selectedTime === t && styles.timeChipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.timeText,
                          selectedTime === t && styles.timeTextSelected,
                        ]}
                      >
                        {t}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          {!isMobile && (
            <View style={[styles.col, styles.colSide]}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Summary</Text>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Barber</Text>
                  <Text style={styles.summaryValue}>
                    {barbers.find(
                      (b) => Number(b.barber_id) === Number(selectedBarberId)
                    )?.name ?? "—"}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Services</Text>
                  <Text style={styles.summaryValue}>
                    {selectedServices.length > 0
                      ? selectedServices
                          .map(
                            (sid) =>
                              services.find(
                                (s) => Number(s.service_id) === Number(sid)
                              )?.serv_name || "—"
                          )
                          .join(", ")
                      : "—"}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Date</Text>
                  <Text style={styles.summaryValue}>{selectedDate || "—"}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Time</Text>
                  <Text style={styles.summaryValue}>{selectedTime || "—"}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>₱{totalAmount}</Text>
                </View>

                {loading ? (
                  <ActivityIndicator size="large" style={{ marginTop: 12 }} />
                ) : (
                  <>
                    {slotTaken && !alreadyBooked && (
                      <Text
                        style={{
                          color: "red",
                          fontWeight: "700",
                          marginBottom: 8,
                        }}
                      >
                        ⚠️ This slot is already taken. Choose another time or
                        barber.
                      </Text>
                    )}

                    <Pressable
                      onPress={
                        alreadyBooked
                          ? () => setShowCancelModal(true)
                          : handleBookNow
                      }
                      style={[
                        styles.primaryBtn,
                        !isReadyToBook() &&
                          !alreadyBooked &&
                          styles.primaryBtnDisabled,
                      ]}
                      disabled={!isReadyToBook() && !alreadyBooked}
                    >
                      <Text style={styles.primaryBtnText}>
                        {alreadyBooked ? "Already Booked" : "Book Now"}
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => navigation.navigate("Home")}
                      style={styles.secondaryBtn}
                    >
                      <Text style={styles.secondaryBtnText}>Back to Home</Text>
                    </Pressable>
                  </>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {isMobile && (
        <View style={styles.stickyBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.stickyLabel}>Total</Text>
            <Text style={styles.stickyTotal}>₱{totalAmount}</Text>
            {slotTaken && !alreadyBooked && (
              <Text style={{ color: "red", fontWeight: "700", marginTop: 4 }}>
                ⚠️ This slot is already taken. Choose another time or barber.
              </Text>
            )}
          </View>

          {loading ? (
            <ActivityIndicator size="small" />
          ) : alreadyBooked ? (
            <Pressable
              style={[styles.stickyBtn, styles.stickyDanger]}
              onPress={() => setShowCancelModal(true)}
            >
              <Text style={styles.stickyBtnText}>Cancel</Text>
            </Pressable>
          ) : (
            <Pressable
              style={[
                styles.stickyBtn,
                !isReadyToBook() && styles.stickyBtnDisabled,
              ]}
              onPress={handleBookNow}
              disabled={!isReadyToBook()}
            >
              <Text style={styles.stickyBtnText}>Book Now</Text>
            </Pressable>
          )}
        </View>
      )}

      <Modal transparent visible={showSuccessModal} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                marginBottom: 6,
                color: "white",
              }}
            >
              ✅ Successfully Booked!
            </Text>
            <Text style={{ fontSize: 16, marginBottom: 16, color: "white" }}>
              Total payment: ₱{totalAmount}
            </Text>
            <Pressable
              style={styles.modalBtn}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.navigate("Home");
              }}
            >
              <Text style={styles.modalBtnText}>Return to Home</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showCancelModal} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                marginBottom: 8,
                color: "white",
              }}
            >
              Cancel Booking?
            </Text>
            <Text style={{ fontSize: 14, marginBottom: 16, color: "white" }}>
              Are you sure you want to cancel your booking?
            </Text>
            <Pressable style={styles.modalBtn} onPress={handleCancelBooking}>
              <Text style={styles.modalBtnText}>Yes, Cancel</Text>
            </Pressable>
            <Pressable
              style={[
                styles.modalBtn,
                { backgroundColor: "#232423", marginTop: 8 },
              ]}
              onPress={() => setShowCancelModal(false)}
            >
              <Text style={[styles.modalBtnText, { color: "#d8d8d8ff" }]}>
                No, Keep
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showCancelledSuccess} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
              ❌ Booking Cancelled
            </Text>
            <Pressable
              style={styles.modalBtn}
              onPress={() => {
                setShowCancelledSuccess(false);
                navigation.navigate("Home");
              }}
            >
              <Text style={styles.modalBtnText}>Return to Home</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ==== STYLES (HomeScreen colors applied) ==== */
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#232423", // dark gray background
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 16,
  },

  /* Header */
  logoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  navLogo: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff", // white text
    fontFamily: "Kristi",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff", // white text
  },
  linkBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#757D75", // purple button
    borderRadius: 10,
  },
  linkBtnText: { color: "#fff", fontWeight: "700" },

  /* Grid */
  grid: {
    flexDirection: "row",
    gap: 16,
  },
  gridMobile: {
    flexDirection: "column",
  },
  col: {
    gap: 16,
  },
  colMain: {
    flex: 1,
  },
  colSide: {
    width: 320,
  },

  /* Cards */
  card: {
    backgroundColor: "#5B6059", // dark gray card
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff", // white text
    marginBottom: 10,
  },

  /* Wrap rows */
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  /* Chips */
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#757D75", // gray border
    backgroundColor: "#757D75", // gray background
  },
  chipSelected: {
    backgroundColor: "#404740ff", // purple selected
    borderColor: "#757D75",
  },
  chipUnavailable: {
    backgroundColor: "#757D75", // dimmed gray
    borderColor: "#757D75",
    opacity: 0.6,
  },
  chipText: { color: "#fff", fontWeight: "600" },
  chipTextSelected: { color: "#fff", fontWeight: "700" },
  chipTextUnavailable: { color: "#111" },

  /* Time chips */
  timeChip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#757D75",
    backgroundColor: "#757D75",
  },
  timeChipSelected: {
    backgroundColor: "#404740ff", // purple selected
    borderColor: "#757D75",
  },
  timeText: { color: "#fff", fontWeight: "600" },
  timeTextSelected: { color: "#fff", fontWeight: "700" },

  /* Summary card (web) */
  summaryCard: {
    backgroundColor: "#5B6059",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    position: "sticky",
    top: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  summaryLabel: { color: "#C7D2FE" }, // light purple/gray
  summaryValue: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "right",
    maxWidth: "60%",
  },
  divider: {
    height: 1,
    backgroundColor: "#444",
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  totalLabel: { fontSize: 16, fontWeight: "700", color: "#fff" },
  totalValue: { fontSize: 18, fontWeight: "800", color: "#fff" },

  primaryBtn: {
    backgroundColor: "#404740ff",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnDisabled: {
    backgroundColor: "#757D75",
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryBtn: {
    marginTop: 10,
    backgroundColor: "#757D75",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  /* Sticky Bottom Bar (mobile) */
  stickyBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#5B6059",
    borderTopWidth: 1,
    borderTopColor: "#444",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
  },
  stickyLabel: { color: "#C7D2FE", fontSize: 12, fontWeight: "700" },
  stickyTotal: { color: "#fff", fontWeight: "800", fontSize: 18, marginTop: 2 },
  stickyBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: "#757D75",
    borderRadius: 12,
  },
  stickyBtnDisabled: { backgroundColor: "#757D75" },
  stickyBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  stickyDanger: { backgroundColor: "#404740ff" },

  /* Modals */
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#5B6059",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    width: "100%",
    maxWidth: 420,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  modalBtn: {
    marginTop: 8,
    backgroundColor: "#757D75",
    paddingVertical: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  modalBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
