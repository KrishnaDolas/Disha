import React, { useState, useContext } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import { AuthContext } from './AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

type LoginScreenProp = StackNavigationProp<RootStackParamList, 'Login'>;

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const authContext = useContext(AuthContext);
  const navigation = useNavigation<LoginScreenProp>();

  const handleLogin = async () => {
    console.log('Login started');
    console.log('Email:', email);
    console.log('Password:', password);

    try {
      const response = await fetch('https://studentbackend-7i2m.onrender.com/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Response received');
      const data = await response.json();
      console.log('Parsed data:', data);

      if (data.status === 'success') {
        console.log('Login successful:', data.token);

        // Store the token in AsyncStorage
        await AsyncStorage.setItem('token', data.token);

        if (authContext && authContext.signIn) {
          console.log('Calling signIn with token:', data.token);
          authContext.signIn(data.token);
          console.log('SignIn completed');
        }

        // Navigate to the DrawerNavigator which contains MarkAttendance
        navigation.navigate('DrawerNavigator');
        console.log('Navigated to DrawerNavigator');
      } else {
        console.log('Login failed:', data.msg);
        Alert.alert('Login Failed', data.msg);
      }
    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    }
  };

  return (
    <View style={styles.container}>
      <Text>Email:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter email"
        value={email}
        onChangeText={setEmail}
      />
      <Text>Password:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default Login;
