import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ShowcaseScreen from './screens/ShowcaseScreen';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import BookingScreen from './screens/BookingScreen';
import ProfileScreen from './screens/ProfileScreen';
import DashboardScreen from './screens/DashboardScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState('Showcase');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');

        if (!storedUser) {
          setInitialRoute('Showcase'); // If no login yet, still show showcase
        } else {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          if (parsedUser.role === "admin") {
            setInitialRoute('Dashboard');
          } else {
            setInitialRoute('Home');
          }
        }

      } catch (err) {
        console.error('Error loading user', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        {/* First screen */}
        <Stack.Screen name="Showcase" component={ShowcaseScreen} />

        <Stack.Screen name="Register" component={RegisterScreen} />

        <Stack.Screen name="Login">
          {props => <LoginScreen {...props} setUser={setUser} />}
        </Stack.Screen>

        <Stack.Screen name="Home">
          {props => <HomeScreen {...props} user={user} setUser={setUser} />}
        </Stack.Screen>

        <Stack.Screen name="Booking">
          {props => <BookingScreen {...props} user={user} />}
        </Stack.Screen>

        <Stack.Screen name="Profile">
          {props => <ProfileScreen {...props} />}
        </Stack.Screen>

        <Stack.Screen name="Dashboard">
          {props => <DashboardScreen {...props} user={user} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
