import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  useWindowDimensions,
  Animated,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function ShowcaseScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  // Refs for sections
  const scrollRef = useRef();
  const homeRef = useRef();
  const detailsRef = useRef();
  const barbersRef = useRef();

  const scrollToSection = (ref) => {
  if (ref.current) {
    ref.current.measure((fx, fy, width, height, px, py) => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: py, animated: true });
      }
    });
  }
};

  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(-200)).current;

  const toggleSidebar = () => {
    if (sidebarOpen) {
      Animated.timing(sidebarAnim, {
        toValue: -200,
        duration: 200,
        useNativeDriver: false,
      }).start(() => setSidebarOpen(false));
    } else {
      setSidebarOpen(true);
      Animated.timing(sidebarAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleNavPress = (ref) => {
    scrollToSection(ref);
    if (!isDesktop) toggleSidebar(); // close sidebar on mobile
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Navbar */}
      <View style={[styles.navbar, isDesktop && styles.navbarDesktop]}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/Logo.png")}
            style={[styles.logo, isDesktop && styles.logoDesktop]}
            resizeMode="contain"
          />
          <Text style={styles.brandName}>THE EJIE BARBERSHOP</Text>
        </View>

        {isDesktop ? (
          <View style={styles.navLinks}>
            <Pressable onPress={() => scrollToSection(homeRef)}>
              <Text style={styles.navLinkText}>Details</Text>
            </Pressable>
            <Pressable onPress={() => scrollToSection(detailsRef)}>
              <Text style={styles.navLinkText}>About Us</Text>
            </Pressable>
            <Pressable onPress={() => scrollToSection(barbersRef)}>
              <Text style={styles.navLinkText}>Barbers</Text>
            </Pressable>
          </View>
        ) : (
          <TouchableOpacity onPress={toggleSidebar} style={{ padding: 10 }}>
            <Text style={{ color: "#fff", fontSize: 24 }}>☰</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Sidebar for mobile */}
      {!isDesktop && sidebarOpen && (
        <Animated.View
          style={[
            styles.sidebar,
            {
              left: sidebarAnim,
            },
          ]}
        >
          <Pressable onPress={() => handleNavPress(homeRef)}>
            <Text style={styles.sidebarLink}>Home</Text>
          </Pressable>
          <Pressable onPress={() => handleNavPress(detailsRef)}>
            <Text style={styles.sidebarLink}>Details</Text>
          </Pressable>
          <Pressable onPress={() => handleNavPress(barbersRef)}>
            <Text style={styles.sidebarLink}>Barbers</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Content */}
      <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
<View ref={homeRef} style={[styles.hero, isDesktop && styles.heroDesktop]}>
  <View
    style={{
      flexDirection: isDesktop ? "row" : "column", // <-- key change
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      gap: 20,
    }}
  >
    {/* Left: Text + Button */}
    <View
      style={{
        flex: isDesktop ? 1 : 0, 
        alignItems: isDesktop ? "flex-start" : "center",
      }}
    >
      <Text style={[styles.heroTitle, isDesktop && styles.heroTitleDesktop]}>
        CONFIDENCE STARTS {"\n"} WITH A FRESH CUT
      </Text>
      <Text style={[styles.heroDesc, isDesktop && styles.heroDescDesktop]}>
        Book your next haircut hassle-free with our online barbershop!
        {"\n"}Choose your stylist, pick a time, and get ready to look your best.
        {"\n"}Say goodbye to waiting and hello to convenience.
      </Text>
      <Pressable
        style={[styles.bookButton, isDesktop && styles.bookButtonDesktop]}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.bookButtonText}>Book Now</Text>
      </Pressable>
    </View>

    {/* Right: Accessories image */}
    <Image
      source={require("../assets/accesories.png")}
      style={{
        width: isDesktop ? 650 : "100%",
        height: isDesktop ? 380 : 220,
        borderRadius: 15,
        marginTop: isDesktop ? 0 : 12,
      }}
    />
  </View>
</View>



        

        {/* Details Section */}
<View
  ref={detailsRef}
  style={[
    styles.detailsSection,
    { paddingHorizontal: isDesktop ? 190 : 20 },
  ]}
>
  {/* Row 1 */}
  <View
    style={[
      styles.detailRow,
      { flexDirection: isDesktop ? "row" : "column", alignItems: isDesktop ? "center" : "flex-start", justifyContent: isDesktop ? "space-between" : "flex-start", marginBottom: 35 },
    ]}
  >
    <Image
      source={require("../assets/qualityOverQuantity.png")}
      style={{
        width: isDesktop ? 350 : "100%",
        height: isDesktop ? 280 : 220,
        borderRadius: 15,
        marginBottom: isDesktop ? 0 : 12,
      }}
    />
    <View style={{ maxWidth: isDesktop ? 380 : "100%" }}>
      <Text style={styles.detailTitle}>QUALITY OVER {"\n"} QUANTITY</Text>
      <Text style={styles.detailDesc}>
        Elevate your grooming routine with our online barbershop. Quality is our priority, from skilled stylists to premium services. Experience the difference. Book your appointment now!
      </Text>
    </View>
  </View>

  {/* Row 2 */}
  <View
    style={[
      styles.detailRow,
      { flexDirection: isDesktop ? "row" : "column-reverse", alignItems: isDesktop ? "center" : "flex-start", justifyContent: isDesktop ? "space-between" : "flex-start", marginBottom: 35 },
    ]}
  >
    <View style={{ maxWidth: isDesktop ? 380 : "100%", marginTop: isDesktop ? 0 : 12 }}>
      <Text style={styles.detailTitle}>Walk in's & Booking</Text>
      <Text style={styles.detailDesc}>
        Conveniently located on Km.10 Sulpicio road, Sasa, Davao City, our barbershop offers hassle-free booking to avoid long waits. While appointments are recommended, walk-ins are always welcome. Visit us today!
      </Text>
    </View>
    <Image
      source={require("../assets/mapDetails.png")}
      style={{
        width: isDesktop ? 350 : "100%",
        height: isDesktop ? 280 : 220,
        borderRadius: 15,
        marginBottom: isDesktop ? 0 : 12,
      }}
    />
  </View>
</View>



        {/* Top Barbers Section */}
        <View ref={barbersRef} style={styles.barbersSection}>
          <Text style={styles.barbersTitle}>Top Barbers</Text>
          <View style={[styles.barbersRow, isDesktop && styles.barbersRowDesktop]}>
            <View style={styles.barberCard}>
              <Image source={require("../assets/Logo.png")} style={styles.barberImage} />
              <Text style={styles.barberName}>Mark</Text>
            </View>
            <View style={styles.barberCard}>
              <Image source={require("../assets/Logo.png")} style={styles.barberImage} />
              <Text style={styles.barberName}>John</Text>
            </View>
            <View style={styles.barberCard}>
              <Image source={require("../assets/Logo.png")} style={styles.barberImage} />
              <Text style={styles.barberName}>Ryann</Text>
            </View>
          </View>
          <Text style={styles.barbersDesc}>
            Step into our barbershop and immerse yourself in the expertise of our seasoned professionals. With a keen eye for detail and years of experience, our skilled barbers guarantee precision cuts that exceed expectations every time. Trust us to deliver a grooming experience that leaves you looking and feeling your best.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#232423",
  },
  navbar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#232423",
  },
  navbarDesktop: {
    justifyContent: "space-between",
    paddingHorizontal: 40,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
  },
  logoDesktop: {
    width: 80,
    height: 80,
  },
  brandName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
    fontFamily: "Kristi",
  },
  navLinks: {
    flexDirection: "row",
    gap: 70,
  },
  navLinkText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  sidebar: {
    position: "absolute",
    top: 60,
    width: 200,
    height: "100%",
    backgroundColor: "#232423",
    paddingVertical: 20,
    paddingHorizontal: 15,
    zIndex: 100,
  },
  sidebarLink: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  hero: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 150,
    paddingHorizontal: 20,
    backgroundColor: "#232423",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heroDesktop: {
    alignItems: "flex-start",
    paddingHorizontal: 80,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#fff",
  },
  heroTitleDesktop: {
    fontSize: 40,
    textAlign: "left",
    color: "#fff",
  },
  heroDesc: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
    color: "#fff",
  },
  heroDescDesktop: {
    fontSize: 18,
    textAlign: "left",
    color: "#fff",
  },
  bookButton: {
    backgroundColor: "#757D75",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  bookButtonDesktop: {
    paddingVertical: 16,
    paddingHorizontal: 40,
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Replace your existing detailsSection styles with:
detailsSection: {
  paddingVertical: 40,
  
},
detailRow: {
  marginBottom: 35,
  alignItems: "center",
  flexDirection: "column", // stack vertically on mobile
},
detailRowDesktop: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 30,
},
detailImage: {
  width: "100%",
  maxWidth: 350, // constrain width for mobile
  height: 220,
  marginBottom: 12,
  borderRadius: 15,
},
detailImageDesktop: {
  width: 350,
  height: 280,
  marginBottom: 0,
},
detailText: {
 
},

  detailTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#fff",
  },
  detailDesc: {
    fontSize: 15,
    lineHeight: 22,
    color: "#fff",
  },
  barbersSection: {
    paddingVertical: 45,
    paddingHorizontal: 20,
    alignItems: "center",
    backgroundColor: "#F9F9F9",
  },
  barbersTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#232423",
  },
  barbersRow: {
    flexDirection: "column",
    gap: 18,
    alignItems: "center",
  },
  barbersRowDesktop: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  barberCard: {
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  barberImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginBottom: 8,
  },
  barberName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  barbersDesc: {
    marginTop: 18,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 750,
    color: "#555",
  },
});
