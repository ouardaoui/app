// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NetworkInfo } from 'react-native-network-info';
import VideoPlayer from 'react-native-video-player';

const Stack = createStackNavigator();

// Authentication Screen
const AuthScreen = ({ navigation }) => {
  const [macAddress, setMacAddress] = useState('');
  
  useEffect(() => {
    const getMacAddress = async () => {
      try {
        const mac = await NetworkInfo.getMACAddress();
        setMacAddress(mac);
        
        // Check if MAC is already authenticated
        const response = await fetch('http://your-api.com/check-auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ macAddress: mac }),
        });
        
        const data = await response.json();
        if (data.isAuthenticated) {
          await AsyncStorage.setItem('userToken', data.token);
          navigation.replace('Stream');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    getMacAddress();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Device MAC Address: {macAddress}</Text>
      <Text>Please contact administrator for access</Text>
    </View>
  );
};

// Streaming Screen
const StreamScreen = () => {
  const [playlist, setPlaylist] = useState([]);
  
  useEffect(() => {
    const fetchPlaylist = async () => {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch('http://your-api.com/playlist', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setPlaylist(data.playlist);
    };
    
    fetchPlaylist();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={playlist}
        renderItem={({ item }) => (
          <VideoPlayer
            video={{ uri: item.url }}
            videoWidth={1600}
            videoHeight={900}
            thumbnail={{ uri: item.thumbnail }}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
});

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Stream" component={StreamScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}