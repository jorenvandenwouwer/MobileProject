import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import MapView from 'react-native-maps';
import fetch from 'node-fetch';



export const FetchData = () => {
  const url = "https://api.jsonbin.io/b/5fba7557a825731fc0a11e8b";
  fetch(url)
  .then(response => response.json())
  .then(dataResponse => console.log(dataResponse))
}


export default function App() {
  const region = {
    latitude: 51.231107,
    longitude: 4.415127,
    latitudeDelta: 0.001,
    longitudeDelta: 0.0421,
  }
    return (
    <View style={styles.container}>
      <Button title="API Press me" onPress={FetchData} />
      {/* <MapView style={styles.mapStyle} region={region}/> 

      <StatusBar style="auto" /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#fff',
    justifyContent: "center"


  },
  mapStyle: {
    flex: 1,
  },

});
