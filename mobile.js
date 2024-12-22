import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { NetworkInfo } from 'react-native-network-info';
import Video from 'react-native-video';

const API_URL = 'http://your-server-url:3000'; // Replace with your actual server URL

const App = () => {
  const [macAddress, setMacAddress] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStream, setSelectedStream] = useState(null);

  useEffect(() => {
    getMacAddress();
  }, []);

  const getMacAddress = async () => {
    try {
      const mac = await NetworkInfo.getMACAddress();
      setMacAddress(mac);
      checkAuthentication(mac);
    } catch (error) {
      setError('Failed to get MAC address');
      setLoading(false);
    }
  };

  const checkAuthentication = async (mac) => {
    try {
      const response = await fetch(`${API_URL}/check-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ macAddress: mac }),
      });
      
      const data = await response.json();
      
      setIsAuthenticated(data.isAuthenticated);
      if (data.isAuthenticated && data.playlist) {
        // Parse the M3U playlist
        const parsedPlaylist = parseM3U(data.playlist);
        setPlaylist(parsedPlaylist);
      }
    } catch (error) {
      setError('Authentication check failed');
    } finally {
      setLoading(false);
    }
  };

  const parseM3U = (playlistContent) => {
    // Basic M3U parser
    const lines = playlistContent.split('\n');
    const streams = [];
    let currentStream = {};

    lines.forEach(line => {
      if (line.startsWith('#EXTINF:')) {
        // Parse stream info
        const title = line.split(',')[1];
        currentStream.title = title;
      } else if (line.startsWith('http')) {
        // Stream URL
        currentStream.url = line.trim();
        streams.push({...currentStream});
        currentStream = {};
      }
    });

    return streams;
  };

  const renderStream = ({ item }) => (
    <View style={styles.streamItem}>
      <Text 
        style={styles.streamTitle}
        onPress={() => setSelectedStream(item)}
      >
        {item.title}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Not Authenticated</Text>
        <Text style={styles.macAddress}>MAC Address: {macAddress}</Text>
        <Text style={styles.message}>
          Please contact administrator to authorize this device.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {selectedStream ? (
        <View style={styles.playerContainer}>
          <Video
            source={{ uri: selectedStream.url }}
            style={styles.videoPlayer}
            controls={true}
            resizeMode="contain"
          />
          <Text 
            style={styles.backButton}
            onPress={() => setSelectedStream(null)}
          >
            Back to List
          </Text>
        </View>
      ) : (
        <FlatList
          data={playlist}
          renderItem={renderStream}
          keyExtractor={(item, index) => index.toString()}
          ListHeaderComponent={() => (
            <Text style={styles.title}>Available Streams</Text>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  macAddress: {
    fontSize: 18,
    marginVertical: 10,
    fontFamily: 'monospace',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
  },
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  streamItem: {
    padding: 15,
    backgroundColor: 'white',
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 8,
    elevation: 2,
  },
  streamTitle: {
    fontSize: 16,
    color: '#333',
  },
  playerContainer: {
    flex: 1,
  },
  videoPlayer: {
    flex: 1,
  },
  backButton: {
    padding: 15,
    textAlign: 'center',
    backgroundColor: '#007AFF',
    color: 'white',
    fontSize: 16,
  },
});

export default App;