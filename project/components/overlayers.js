import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer} from '@react-navigation/native';
import { StyleSheet, Text, View , Modal} from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import fetch from 'node-fetch';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';

import { createStackNavigator} from '@react-navigation/stack'

import { Button, Overlay } from 'react-native-elements';

export default OverlayExample = () => {
  const [visible, setVisible] = useState(false);

  const toggleOverlay = () => {
    setVisible(!visible);
  };

  return (
    <View>
      <Button title="Open Overlay" onPress={toggleOverlay} />
      <Overlay isVisible={visible} onBackdropPress={toggleOverlay}>
        <Text>Hello from Overlay!</Text>
      </Overlay>
    </View>
  );
};