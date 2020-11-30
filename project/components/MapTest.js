import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer} from '@react-navigation/native';
import { Button,StyleSheet, Text, View , Modal} from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import fetch from 'node-fetch';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import {  Overlay } from 'react-native-elements';

import { createStackNavigator} from '@react-navigation/stack'
export default MapScreen = ({navigation}) => {
    const loadLocationData = async() => {
      try {
        let respone = await fetch("https://api.jsonbin.io/b/5fbb8b2b522f1f0550cc78f9");
        let json = await respone.json();
        setLocaties(json.features);
      } catch(error){
        console.log(error)
      }
    }
   
      const [locaties,setLocaties] = useState([]); 
      useEffect(() => {
        loadLocationData();
      }, [])
      const mapMarkers = () => {
        return locaties.map((locatie) => 
        <Marker
            onPress={toggleOverlay}
            key={locatie.attributes.OBJECTID}
            coordinate={{latitude: locatie.attributes.Latitude,longitude:locatie.attributes.Longitude}}
            title={locatie.attributes.Naam}
            />
          )
      }
    const region = {
      latitude: 51.231107,
      longitude: 4.415127,
      latitudeDelta: 0.3,
      longitudeDelta: 0.3,
    }
  
    const toggleOverlay = () => {
        setShowModel(!showModel);
  };

    const [showModel, setShowModel] = useState(false);
    return (
      <View style={styles.container}>  
        <MapView style={styles.mapStyle} region={region}> 
        {mapMarkers()}
        
        </MapView>

        <Modal
             transparent={true}
             visible={showModel}
            >
                <View style={{backgroundColor:"#000000aa", flex: 1, flexDirection:"column-reverse"}}>
                    <View style={{backgroundColor:"#ffffff", margin:50, padding:40, borderRadius:10}}>
                        <Text style={{fontSize: 40}}>This is the Modal</Text>
                        <Button title="Exit Model" onPress={() => setShowModel(!showModel)} />
                    </View>
                    
                </View>
            </Modal>
        <StatusBar style="auto" />
      </View>
    )
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1, 
      backgroundColor: '#fff',
      justifyContent: "center"
  
  
    },
    mapStyle: {
      flex: 1,
      zIndex: -1
    },
    overlay: {
      position: 'absolute',
      width: 20,
      height: 20,
      top: 10,
      left: 10,
      zIndex: 10
    },
  
  });