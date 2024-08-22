import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { launchImageLibrary, launchCamera, ImagePickerResponse } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { fromFetch } from 'rxjs/fetch';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

type ApiResponse = {
  status: string;
  msg?: string;
};

const MarkAttendance = () => {
  const [fileUri, setFileUri] = useState<string | undefined>(undefined);
  const [fileType, setFileType] = useState<string>('image/jpeg');
  const [fileName, setFileName] = useState<string>('attendance_image.jpg');
  const [status, setStatus] = useState<string>('present');

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
        console.log('Camera permission:', granted);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Camera permission request failed', err);
        return false;
      }
    }
    return true;
  };

  const handleChooseFile = () => {
    console.log('Choosing image from library...');
    launchImageLibrary({ mediaType: 'photo' }, (response: ImagePickerResponse) => {
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        setFileUri(asset.uri);
        setFileType(asset.type || 'image/jpeg');
        setFileName(asset.fileName || 'attendance_image.jpg');
        console.log('Image selected:', asset.uri);
      } else {
        Alert.alert('Error', 'No image selected.');
        console.log('No image selected');
      }
    });
  };

  const handleCaptureImage = async () => {
    console.log('Capturing image...');
    const granted = await requestPermissions();
    if (!granted) {
      Alert.alert('Permission Denied', 'You need to grant camera permissions to use this feature.');
      console.log('Camera permission denied');
      return;
    }

    launchCamera({ mediaType: 'photo' }, (response: ImagePickerResponse) => {
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        setFileUri(asset.uri);
        setFileType(asset.type || 'image/jpeg');
        setFileName(asset.fileName || 'attendance_image.jpg');
        console.log('Image captured:', asset.uri);
      } else {
        Alert.alert('Error', 'Failed to capture image.');
        console.log('Failed to capture image');
      }
    });
  };

  const handleSubmit = async () => {
    console.log('Submitting attendance...');
  
    if (!fileUri) {
      Alert.alert('No Image', 'Please select or capture an image to upload.');
      console.log('No image to upload');
      return;
    }
  
    // Prepare form data for the image file and status
    const formData = new FormData();
    formData.append('image', {
      uri: fileUri,
      type: fileType,  // Ensure you set the correct type for the image (e.g., "image/jpeg")
      name: fileName,  // The name of the file
    });
    formData.append('status', JSON.stringify({ status: "present" }));  // Send status as a JSON string
  
    try {
      const token = await AsyncStorage.getItem('token');
  
      if (!token) {
        Alert.alert('Authentication Error', 'No authentication token found. Please log in again.');
        console.log('No token found');
        return;
      }
  
      console.log('Token retrieved:', token);
  
      const response = await fetch('https://studentbackend-7i2m.onrender.com/api/v1/teacher/markPresent', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,  // Correct Authorization header with Bearer token
          // No need to set Content-Type, it will be automatically set to multipart/form-data
        },
        body: formData,  // Send the FormData object as the request body
      });
  
      console.log('Response status:', response.status);
      
      const responseData = await response.json();
      console.log('API Response:', responseData);
      
      if (response.status !== 200) {
        console.log('Response not OK, status text:', responseData.msg || 'Unknown error');
        Alert.alert('Error', responseData.msg || 'An error occurred.');
      } else {
        Alert.alert('Success', 'Image and status uploaded successfully.');
        setFileUri(undefined);
        setStatus('present');
        console.log('Attendance submitted successfully');
      }
    } catch (error) {
      console.log('Submission error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mark Attendance</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleChooseFile} style={styles.button}>
          <Text style={styles.buttonText}>Choose Image</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleCaptureImage} style={styles.button}>
          <Text style={styles.buttonText}>Capture Image</Text>
        </TouchableOpacity>
      </View>

      {fileUri && <Image source={{ uri: fileUri }} style={styles.image} />}

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Status:</Text>
        <Picker
          selectedValue={status}
          style={styles.picker}
          onValueChange={(itemValue: string) => setStatus(itemValue)}
        >
          <Picker.Item label="Present" value="present" />
          <Picker.Item label="Absent" value="absent" />
          <Picker.Item label="Late" value="late" />
          <Picker.Item label="Leave" value="leave" />
        </Picker>
      </View>

      <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginVertical: 10,
  },
  pickerContainer: {
    marginVertical: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  submitButton: {
    backgroundColor: '#28A745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MarkAttendance;
