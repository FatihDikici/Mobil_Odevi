import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HomePage, LabPage, ProfilePage, AdminPage, SearchPage, AnalysisPage } from '../screens';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/userSlice';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BottomTabs() {
  const role = useSelector((state) => state.user.role);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Lab') {
            iconName = focused ? 'flask' : 'flask-outline';
          } else if (route.name === 'AdminProfile') {
            iconName = focused ? 'settings' : 'settings-outline'; // Admin için ikon
          } else if (route.name === 'Profilim') {
            iconName = focused ? 'person' : 'person-outline'; // Tahlillerim ikonu
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Tahlillerim') {
            iconName = focused ? 'pulse' : 'pulse-outline'; // Profil ikonu
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#d01a1a',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          borderTopWidth: 0.5,
          borderTopColor: 'black',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomePage} options={{ headerShown: false }} />
      {role === 'admin' && (
        <>
          <Tab.Screen name="Lab" component={LabPage} options={{ headerShown: false }} />
          <Tab.Screen name="Search" component={SearchPage} options={{ headerShown: false }} />
          <Tab.Screen name="AdminProfile" component={AdminPage} options={{ headerShown: false }} />
        </>
      )}
      {role === 'user' && (
        <>
          <Tab.Screen name="Profilim" component={ProfilePage} options={{ headerShown: false }} />
          <Tab.Screen name="Tahlillerim" component={AnalysisPage} options={{ headerShown: false }} />
        </>
      )}
    </Tab.Navigator>
  );
}

// Logout Component
function LogoutScreen() {
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(logout());
  }, [dispatch]);

  return (
    <View style={styles.logoutContainer}>
      <Text>Checking out...</Text>
    </View>
  );
}

// Drawer Navigator
function UserStack() {
  return (
    <Drawer.Navigator 
      initialRouteName="MainTabs" 
      screenOptions={{
        drawerLabelStyle: {
          color: '#d01a1a',
          fontWeight: 'bold',
        },
      }}
    >
      <Drawer.Screen 
        name="Velaa Private Island" 
        component={BottomTabs} 
        options={{
          title: 'LABCONNECT',
          headerStyle: {
            backgroundColor: '#d01a1a',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <Drawer.Screen 
        name="Sign Out" 
        component={LogoutScreen} 
      />
    </Drawer.Navigator>
  );
}

export default UserStack;

const styles = StyleSheet.create({
  logoutContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});