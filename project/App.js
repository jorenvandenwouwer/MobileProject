import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import MapView from 'react-native-maps';
import fetch from 'node-fetch';


export default function App() {
  const region = {
    latitude: 51.231107,
    longitude: 4.415127,
    latitudeDelta: 0.001,
    longitudeDelta: 0.0421,
  }
    return (
    <View style={styles.container}>
      {/* <Button title="API Press me" onPress={() => { 
        fetch('https://api.jsonbin.io/b/5fb4e46b04be4f05c926c292')
        .then(res => res.json())
        .then(json => alert(json))
      }}/>*/}
      <MapView style={styles.mapStyle} region={region}/> 

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#fff',
    //justifyContent: "center"


  },
  mapStyle: {
    flex: 1,
  },

});
