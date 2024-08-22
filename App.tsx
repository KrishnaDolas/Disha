import React, { useEffect, useState, useMemo } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

import MarkAttendance from './Components/MarkAttendance';
import AddWork from './Components/AddWork';
import Leave from './Components/Leave';
import CustomDrawerContent from './Components/CustomDrawerContent';
import Login from './Components/Login';
import { AuthContext } from './Components/AuthContext';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function DrawerNavigator() {
  return (
    <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen
        name="Mark Attendance"
        component={MarkAttendance}
        options={{
          drawerIcon: () => (
            <Image
              source={require('./assets/done.png')}
              style={styles.icon}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Add Work"
        component={AddWork}
        options={{
          drawerIcon: () => (
            <Image
              source={require('./assets/done1.png')}
              style={styles.icon}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Leave"
        component={Leave}
        options={{
          drawerIcon: () => (
            <Image
              source={require('./assets/calender.png')}
              style={styles.icon}
            />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

const App: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    const clearStorage = async () => {
      try {
        await AsyncStorage.clear();
        console.log('AsyncStorage cleared');
      } catch (error) {
        console.error('Error clearing AsyncStorage:', error);
      }
    };

    clearStorage();
  }, []);

  const authContext = useMemo(() => ({
    signIn: (token: string) => {
      setUserToken(token);
    },
    signOut: () => {
      setUserToken(null);
    },
  }), []);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <AuthContext.Provider value={authContext}>
      <SafeAreaProvider>
        <SafeAreaView style={[styles.safeArea, backgroundStyle]}>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={backgroundStyle.backgroundColor}
          />
          <NavigationContainer>
            <Stack.Navigator>
              {!userToken ? (
                <Stack.Screen
                  name="Login"
                  component={Login}
                  options={{ headerShown: false }}
                />
              ) : (
                <Stack.Screen
                  name="DrawerNavigator"
                  component={DrawerNavigator}
                  options={{ headerShown: false }}
                />
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaView>
      </SafeAreaProvider>
    </AuthContext.Provider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  icon: {
    width: 20,
    height: 20,
  },
});

export default App;
